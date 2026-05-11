import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { maestrasService, CategoriaDto, MarcaDto, ColorDto, TalleDto } from '@/lib/services/maestrasService'
import { productoService, CrearVarianteDto } from '@/lib/services/productoService'
import { useToast } from '@/components/ui/use-toast'

export function useNuevoProducto() {
  const router = useRouter()

  const { toast } = useToast()

  // 1. Estados
  const [categorias, setCategorias] = useState<CategoriaDto[]>([])
  const [marcas, setMarcas] = useState<MarcaDto[]>([])
  const [colores, setColores] = useState<ColorDto[]>([])
  const [talles, setTalles] = useState<TalleDto[]>([])

  const [producto, setProducto] = useState({
    categoriaId: '', marcaId: '', nombre: '', descripcion: '', imagenUrl: '', precioBase: ''
  })

  const [variantes, setVariantes] = useState<CrearVarianteDto[]>([
    { talleId: 0, colorId: 0, sku: '', stockInicial: 0 }
  ])

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
      maestrasService.obtenerTallesPorCategoria(Number(producto.categoriaId))
        .then(setTalles)
        .catch(console.error)
      
      setVariantes(prev => prev.map(v => ({ ...v, talleId: 0 })))
    } else {
      setTalles([])
    }
  }, [producto.categoriaId])

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
      
      router.push('/admin/productos')
    } catch (error: any) {
      
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message,
      })
      
    }
  }

  const cancelar = () => router.back()

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