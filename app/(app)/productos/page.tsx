'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { productoService } from '@/lib/services/productoService'

// Interfaz temporal para maquetar. 
// A futuro esto vendrá de un productoService.obtenerProductosMaestros()
interface ProductoMaestro {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  precioBase: number;
  imagenUrl?: string;
}

export default function CatalogoPage() {
  const [productos, setProductos] = useState<ProductoMaestro[]>([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    productoService.obtenerProductosMaestros()
      .then(data => setProductos(data))
      .catch(err => console.error("Error al cargar el catálogo:", err))
  }, [])

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Cabecera de la página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catálogo de Productos</h1>
          <p className="text-sm text-slate-500">Gestiona los modelos, precios base y categorías.</p>
        </div>
        
        {/* El botón que conecta con tu formulario actual */}
        <Link href="/productos/nuevo">
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Agregar Modelo
          </Button>
        </Link>
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <Input 
          placeholder="Buscar por nombre o marca..." 
          className="border-0 shadow-none focus-visible:ring-0 px-2"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de datos (Responsive) */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[80px] text-center">Imagen</TableHead>
                <TableHead>Nombre del Modelo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio Base</TableHead>
                <TableHead className="w-[100px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No se encontraron productos en el catálogo.
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="text-center">
                      <div className="h-10 w-10 rounded bg-slate-100 border flex items-center justify-center mx-auto overflow-hidden">
                        {producto.imagenUrl ? (
                          <img src={producto.imagenUrl} alt={producto.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{producto.nombre}</TableCell>
                    <TableCell>{producto.marca}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {producto.categoria}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${producto.precioBase.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/productos/${producto.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}