'use client'

import { useEditarProducto } from '@/hooks/useEditarProducto'
import { ProductoMaestroForm } from '@/components/admin/productos/ProductoMaestroForm'
import { VariantesForm } from '@/components/admin/productos/VariantesForm'
import { Button } from '@/components/ui/button'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { use } from 'react'

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productoId = Number(resolvedParams.id);
  
  const { estado, acciones } = useEditarProducto(productoId)

  if (estado.cargando) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={acciones.cancelar}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
      </div>

      <form onSubmit={acciones.guardarCambios} className="space-y-8">

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
          esEdicion={true}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={acciones.cancelar}>
            Cancelar
          </Button>
          <Button type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" /> Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}