import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { maestrasService, CategoriaDto, MarcaDto, ColorDto, TalleDto } from '@/lib/services/maestrasService'
import { productoService, CrearVarianteDto } from '@/lib/services/productoService'
import { useToast } from '@/components/ui/use-toast'

const STORAGE_KEY = 'form-nuevo-producto'

type ProductoForm = {
  categoriaId: string
  marcaId: string
  nombre: string
  descripcion: string
  imagenUrl: string
  precioBase: string
}

const PRODUCTO_DEFAULT: ProductoForm = {
  categoriaId: '', marcaId: '', nombre: '', descripcion: '', imagenUrl: '', precioBase: '',
}

const VARIANTES_DEFAULT: CrearVarianteDto[] = [
  { talleId: 0, colorId: 0, sku: '', stockInicial: 0 }
]

// Lee el estado persistido en sessionStorage. Solo `producto` y `variantes`
// (los catálogos vienen de la API). Tolerante a storage no disponible / JSON corrupto.
function leerEstadoGuardado(): { producto?: ProductoForm; variantes?: CrearVarianteDto[] } {
  try {
    if (typeof window === 'undefined') return {}
    const crudo = window.sessionStorage.getItem(STORAGE_KEY)
    if (!crudo) return {}
    const data = JSON.parse(crudo)
    return {
      producto: data?.producto,
      variantes: Array.isArray(data?.variantes) ? data.variantes : undefined,
    }
  } catch {
    return {}
  }
}

export function useNuevoProducto() {
  const router = useRouter()

  const { toast } = useToast()

  // 1. Estados
  const [categorias, setCategorias] = useState<CategoriaDto[]>([])
  const [marcas, setMarcas] = useState<MarcaDto[]>([])
  const [colores, setColores] = useState<ColorDto[]>([])
  const [talles, setTalles] = useState<TalleDto[]>([])

  // Estado guardado, leído UNA sola vez durante el render y almacenado en un ref.
  // Al ser un ref (no useState) NO afecta el HTML renderizado, así que no provoca
  // hydration mismatch. Además leerEstadoGuardado() corta con
  // `typeof window === 'undefined'`: en SSR devuelve {} y nunca lee sessionStorage
  // crudo en el servidor. La restauración real ocurre en un useEffect (solo cliente).
  const guardadoInicial = useRef(leerEstadoGuardado())

  // La restauración inicial ya corrió. Hasta que sea true, la persistencia NO guarda.
  const yaRestaurado = useRef(false)

  // El próximo cambio de categoriaId proviene de la restauración: el efecto cascada
  // debe saltear (una sola vez) la carga y el reset de talleId, porque el efecto de
  // restauración ya cargó los talles y el talleId restaurado debe conservarse.
  const saltearCascadaRestauracion = useRef(false)

  // Inicializamos SIEMPRE con los defaults vacíos, idéntico al servidor. La
  // restauración se hace después, en un efecto que solo corre en cliente. Esto
  // elimina el hydration mismatch (el <img> de preview vs. el placeholder).
  const [producto, setProducto] = useState<ProductoForm>({ ...PRODUCTO_DEFAULT })

  const [variantes, setVariantes] = useState<CrearVarianteDto[]>(
    VARIANTES_DEFAULT.map(v => ({ ...v }))
  )

  // Persistencia: guardar `producto` y `variantes` cada vez que cambian.
  // DEPENDENCIA DE ORDEN DE EFECTOS: este efecto está declarado ANTES que el de
  // restauración, por lo que en el mount corre PRIMERO, con los defaults vacíos.
  // El guard `!yaRestaurado.current` evita que ese primer disparo sobrescriba
  // (clobber) los datos guardados antes de poder restaurarlos, y de paso evita un
  // loop con el efecto de restauración. Cuando la restauración corre y pone
  // yaRestaurado=true, sus setState vuelven a disparar este efecto y recién ahí se
  // persiste el estado restaurado; las ediciones posteriores guardan normal.
  useEffect(() => {
    if (!yaRestaurado.current) return
    try {
      if (typeof window === 'undefined') return
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ producto, variantes }))
    } catch {
      // sessionStorage no disponible (modo privado, cuota, etc.): no rompemos el formulario.
    }
  }, [producto, variantes])

  const limpiarEstadoGuardado = () => {
    try {
      if (typeof window === 'undefined') return
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignorar errores de storage
    }
  }

  // 2. Carga Inicial
  useEffect(() => {
    Promise.all([
      maestrasService.obtenerCategorias(),
      maestrasService.obtenerMarcas(),
      maestrasService.obtenerColores()
    ]).then(([cats, mrks, cols]) => {
      setCategorias(cats)
      setMarcas(mrks)
      setColores(cols)
    }).catch(err => console.error("Error cargando catálogos", err))
  }, [])

  // 3. Efecto Cascada (Talles dependientes de Categoría)
  useEffect(() => {
    if (producto.categoriaId) {
      // El flag solo se consume dentro de la rama truthy: la corrida inicial con
      // categoriaId vacío entra al else y nunca lo toca. Así, cuando la
      // restauración mete una categoriaId, saltamos carga + reset una única vez y
      // conservamos el talleId restaurado.
      if (saltearCascadaRestauracion.current) {
        saltearCascadaRestauracion.current = false
        return
      }
      maestrasService.obtenerTallesPorCategoria(Number(producto.categoriaId))
        .then(setTalles)
        .catch(console.error)
      setVariantes(prev => prev.map(v => ({ ...v, talleId: 0 })))
    } else {
      setTalles([])
    }
  }, [producto.categoriaId])

  // 3.b Restauración: corre UNA sola vez al montar y SOLO en cliente (useEffect no
  // se ejecuta en SSR). Lee lo capturado en guardadoInicial, valida la forma y, si
  // hay datos, restaura el estado.
  // DEPENDENCIA DE ORDEN DE EFECTOS: está declarado DESPUÉS del cascada a propósito.
  // En el mount el cascada corre primero con categoriaId vacío (rama else, sin tocar
  // el flag); recién después restauramos. Si la categoría restaurada tiene talles,
  // los cargamos explícitamente acá (no solo delegado al cascada) para que el
  // <select> de talle tenga sus <option> cuanto antes y el talleId restaurado quede
  // seleccionado. El cascada, al dispararse por el nuevo categoriaId, salteará su
  // carga/reset gracias a saltearCascadaRestauracion.
  useEffect(() => {
    const { producto: pGuardado, variantes: vGuardadas } = guardadoInicial.current

    if (pGuardado && typeof pGuardado === 'object') {
      const productoRestaurado = { ...PRODUCTO_DEFAULT, ...pGuardado }

      if (productoRestaurado.categoriaId) {
        saltearCascadaRestauracion.current = true
        maestrasService.obtenerTallesPorCategoria(Number(productoRestaurado.categoriaId))
          .then(setTalles)
          .catch(console.error)
      }

      setProducto(productoRestaurado)
      if (Array.isArray(vGuardadas) && vGuardadas.length > 0) {
        setVariantes(vGuardadas.map(v => ({ ...v })))
      }
    }

    yaRestaurado.current = true
  }, [])

  // 4. Funciones de actualización (Handlers)
  const actualizarProducto = (campo: string, valor: string) => {
    setProducto(prev => ({ ...prev, [campo]: valor }))
  }

  const agregarVariante = () => {
    setVariantes([...variantes, { talleId: 0, colorId: 0, sku: '', stockInicial: 0 }])
  }

  const eliminarVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index))
  }

  const actualizarVariante = (index: number, campo: keyof CrearVarianteDto, valor: string | number) => {
    const nuevas = [...variantes]
    nuevas[index] = { ...nuevas[index], [campo]: valor }
    setVariantes(nuevas)
  }

  // 5. Lógica de guardado
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await productoService.crearProductoCompleto({
        categoriaId: Number(producto.categoriaId),
        marcaId: Number(producto.marcaId),
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precioBase: Number(producto.precioBase),
        imagenUrl: producto.imagenUrl,
        variantes: variantes.map(v => ({
          ...v, 
          talleId: Number(v.talleId), 
          colorId: Number(v.colorId), 
          stockInicial: Number(v.stockInicial)
        }))
      })
      
      toast({
        title: "¡Mercadería ingresada!",
        description: "El producto y su stock inicial se guardaron correctamente.",
      })

      limpiarEstadoGuardado()
      router.push('/productos')
    } catch (error: any) {
      
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message,
      })
      
    }
  }

  const cancelar = () => {
    limpiarEstadoGuardado()
    router.back()
  }

  return {
    estado: {
      producto,
      variantes,
      catalogos: { categorias, marcas, colores, talles },
      categoriaSeleccionada: !!producto.categoriaId
    },
    acciones: {
      actualizarProducto,
      agregarVariante,
      eliminarVariante,
      actualizarVariante,
      guardarProducto,
      cancelar
    }
  }
}