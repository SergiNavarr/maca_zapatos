'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Package, Tag, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { productoService, ProductoDetalleDto } from '@/lib/services/productoService'

export default function DetalleProductoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<ProductoDetalleDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      productoService.obtenerDetalle(Number(id))
        .then(data => setProducto(data))
        .catch(() => console.error("Error al cargar detalle"))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando ficha de producto...</div>
  if (!producto) return <div className="p-8 text-center text-red-500">Producto no encontrado</div>

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      {/* Navegación y Acciones Rápidas */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
        </Button>
        <Button className="bg-indigo-600">
          <Edit className="mr-2 h-4 w-4" /> Editar Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información General */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <div className="h-48 w-full bg-slate-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden border">
              {producto.imagenUrl ? (
                <img src={producto.imagenUrl} className="h-full w-full object-cover" alt={producto.nombre} />
              ) : (
                <Package className="h-12 w-12 text-slate-300" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">{producto.nombre}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">{producto.marca}</Badge>
              <Badge variant="secondary">{producto.categoria}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Precio de Venta Sugerido</p>
              <p className="text-2xl font-black text-slate-900">${producto.precioBase.toLocaleString('es-AR')}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Info className="h-4 w-4" /> Descripción
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {producto.descripcion || "Sin descripción disponible."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Columna Derecha: Grilla de Variantes y Stock */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-600" /> Variantes Disponibles
            </CardTitle>
            <Badge variant="outline">{producto.variantes.length} Variantes</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Talle</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>SKU / Código</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producto.variantes.map((v) => (
                  <TableRow key={v.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-700">{v.talle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full border border-slate-300" 
                          style={{ backgroundColor: v.colorHex }} 
                        />
                        <span className="text-sm">{v.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{v.sku}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${v.stock <= 2 ? 'text-red-600' : 'text-slate-900'}`}>
                        {v.stock} u.
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}