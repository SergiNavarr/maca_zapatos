'use client'

import { useNuevoProducto } from '@/hooks/useNuevoProducto'
import { ProductoMaestroForm } from '@/components/admin/productos/ProductoMaestroForm'
import { VariantesForm } from '@/components/admin/productos/VariantesForm'
import { Button } from '@/components/ui/button'
import { Save, ArrowLeft } from 'lucide-react'

export default function NuevoProductoPage() {
  // Consumimos todo desde nuestro Hook
  const { estado, acciones } = useNuevoProducto()

  return (
    <div className="max-w-5xl mx-auto p-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={acciones.cancelar}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Ingreso de Nueva Mercadería</h1>
      </div>

      <form onSubmit={acciones.guardarProducto} className="space-y-8">
        
        <ProductoMaestroForm 
          producto={estado.producto}
          actualizarProducto={acciones.actualizarProducto}
          categorias={estado.catalogos.categorias}
          marcas={estado.catalogos.marcas}
        />

        <VariantesForm 
          variantes={estado.variantes}
          talles={estado.catalogos.talles}
          colores={estado.catalogos.colores}
          categoriaSeleccionada={estado.categoriaSeleccionada}
          agregarVariante={acciones.agregarVariante}
          eliminarVariante={acciones.eliminarVariante}
          actualizarVariante={acciones.actualizarVariante}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={acciones.cancelar}>
            Cancelar
          </Button>
          <Button type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" /> Guardar y Generar Stock
          </Button>
        </div>
      </form>
    </div>
  )
}