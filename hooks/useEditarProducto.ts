import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { maestrasService, CategoriaDto, MarcaDto, ColorDto, TalleDto } from '@/lib/services/maestrasService'
import { productoService, ActualizarProductoCompletoDto } from '@/lib/services/productoService'
import { useToast } from '@/components/ui/use-toast'

export function useEditarProducto(productoId: number) {
  const router = useRouter()
  const { toast } = useToast()

  const [cargando, setCargando] = useState(true)
  const [categorias, setCategorias] = useState<CategoriaDto[]>([])
  const [marcas, setMarcas] = useState<MarcaDto[]>([])
  const [colores, setColores] = useState<ColorDto[]>([])
  const [talles, setTalles] = useState<TalleDto[]>([])

  const [producto, setProducto] = useState({
    categoriaId: '', marcaId: '', nombre: '', descripcion: '', imagenUrl: '', precioBase: '',
  })

  // Acá guardamos las variantes. Le agregamos 'id' opcional para saber si ya existían.
  const [variantes, setVariantes] = useState<any[]>([])

  // Carga Inicial: Catálogos + Datos del Producto
  useEffect(() => {
    if (!productoId) return;

    setCargando(true)
    Promise.all([
      maestrasService.obtenerCategorias(),
      maestrasService.obtenerMarcas(),
      maestrasService.obtenerColores(),
      productoService.obtenerDetalle(productoId)
    ]).then(([cats, mrks, cols, detalle]) => {
      setCategorias(cats)
      setMarcas(mrks)
      setColores(cols)

      // Rellenamos el estado del producto maestro
      const catId = cats.find(c => c.nombre === detalle.categoria)?.id.toString() || ''
      const marId = mrks.find(m => m.nombre === detalle.marca)?.id.toString() || ''
      
      setProducto({
        categoriaId: catId,
        marcaId: marId,
        nombre: detalle.nombre,
        descripcion: detalle.descripcion || '',
        imagenUrl: detalle.imagenUrl || '',
        precioBase: detalle.precioBase.toString(),
      })


      if (catId) {
         maestrasService.obtenerTallesPorCategoria(Number(catId)).then(setTalles)
      }

      // Rellenamos las variantes
      // 1. Mapeamos las variantes guardando el nombre del talle temporalmente
      const variantesMapeadas = detalle.variantes.map(v => {
        const colId = cols.find(c => c.nombre === v.color)?.id || 0;
        return {
          id: v.id,
          talleId: 0, 
          talleNombreTemporal: v.talle, // Lo guardamos para buscar su ID en el paso siguiente
          colorId: colId,
          sku: v.sku,
          stockInicial: v.stock 
        }
      });
      
      // 2. Cargamos los talles de la categoría y asociamos los IDs de inmediato
      if (catId) {
         maestrasService.obtenerTallesPorCategoria(Number(catId)).then(tallesCat => {
             setTalles(tallesCat);
             // Ahora que tenemos los talles, actualizamos el estado final con los IDs correctos
             setVariantes(variantesMapeadas.map(v => ({
                 ...v,
                 talleId: tallesCat.find(t =>  t.valor === v.talleNombreTemporal)?.id || 0
             })));
         });
      } else {
         setVariantes(variantesMapeadas);
      }
    }).catch(err => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el producto." })
    }).finally(() => setCargando(false))
  }, [productoId])

  // Efecto Cascada (Talles dependientes de Categoría)
  useEffect(() => {
    if (producto.categoriaId && !cargando) {
      maestrasService.obtenerTallesPorCategoria(Number(producto.categoriaId))
        .then(setTalles)
        .catch(console.error)
    }
  }, [producto.categoriaId, cargando])

  // Funciones de actualización 
  const actualizarProducto = (campo: string, valor: string) => {
    setProducto(prev => ({ ...prev, [campo]: valor }))
  }

  const agregarVariante = () => {
    setVariantes([...variantes, { talleId: 0, colorId: 0, sku: '', stockInicial: 0 }])
  }

  const eliminarVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index))
  }

  const actualizarVariante = (index: number, campo: string, valor: string | number) => {
    const nuevas = [...variantes]
    nuevas[index] = { ...nuevas[index], [campo]: valor }
    setVariantes(nuevas)
  }

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: ActualizarProductoCompletoDto = {
        categoriaId: Number(producto.categoriaId),
        marcaId: Number(producto.marcaId),
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagenUrl: producto.imagenUrl,
        precioBase: Number(producto.precioBase),
        variantes: variantes.map(v => ({
          id: v.id,
          talleId: Number(v.talleId),
          colorId: Number(v.colorId),
          sku: v.sku
        }))
      }

      await productoService.actualizarProductoCompleto(productoId, payload)
      toast({ title: "¡Actualizado!", description: "El producto se modificó correctamente." })
      router.push('/productos')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al actualizar", description: error.message })
    }
  }

  const cancelar = () => router.back()

  return {
    estado: { producto, variantes, catalogos: { categorias, marcas, colores, talles }, categoriaSeleccionada: !!producto.categoriaId, cargando },
    acciones: { actualizarProducto, agregarVariante, eliminarVariante, actualizarVariante, guardarCambios, cancelar }
  }
}