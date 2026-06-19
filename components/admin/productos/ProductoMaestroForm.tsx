'use client'

import { useState, useRef } from 'react'
import { CategoriaDto, MarcaDto } from '@/lib/services/maestrasService'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { uploadService } from '@/lib/services/uploadService'
import { Button } from '@/components/ui/button'

interface ProductoMaestroFormProps {
  producto: {
    categoriaId: string;
    marcaId: string;
    nombre: string;
    descripcion: string;
    precioBase: string;
    imagenUrl?: string;
    skuBase?: string;
  };
  actualizarProducto: (campo: string, valor: string) => void;
  categorias: CategoriaDto[];
  marcas: MarcaDto[];
  // Solo "nuevo producto" muestra el campo de código base (SKU). En edición el SKU
  // ya existe por variante y el backend no lo regenera, así que no se muestra.
  mostrarSkuBase?: boolean;
}

export function ProductoMaestroForm({ producto, actualizarProducto, categorias, marcas, mostrarSkuBase = false }: ProductoMaestroFormProps) {
  const { toast } = useToast()
  
  // Estados para manejar la carga de la imagen
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSubiendo(true)
      const urlGenerada = await uploadService.subirImagen(file)

      actualizarProducto('imagenUrl', urlGenerada)
      
      toast({ title: "Foto subida", description: "La imagen se procesó correctamente." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setSubiendo(false)
    }
  }

  const removerImagen = () => {
    actualizarProducto('imagenUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Datos Generales</h2>

      <div className="space-y-3 pb-4">
        <label className="text-sm font-medium">Foto del Producto</label>
        <div className="flex items-center gap-4">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 overflow-hidden group">
            {producto.imagenUrl ? (
              <>
                <img src={producto.imagenUrl} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={removerImagen}
                  disabled={subiendo}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
            )}

            {subiendo && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
              disabled={subiendo}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
            >
              {subiendo ? 'Subiendo foto...' : 'Seleccionar archivo'}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Soporta JPG o PNG. Se recortará en formato cuadrado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre del Modelo</label>
          <input required type="text" className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm" 
                 value={producto.nombre} onChange={e => actualizarProducto('nombre', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Precio Base ($)</label>
          <input required type="number" min="0" className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm" 
                 value={producto.precioBase} onChange={e => actualizarProducto('precioBase', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select required className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                  value={producto.categoriaId} onChange={e => actualizarProducto('categoriaId', e.target.value)}>
            <option value="">Seleccione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Marca</label>
          <select required className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                  value={producto.marcaId} onChange={e => actualizarProducto('marcaId', e.target.value)}>
            <option value="">Seleccione...</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        
        {mostrarSkuBase && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Código base (SKU)</label>
            <input required type="text" placeholder="Ej: NKE-AIRMAX" className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm uppercase"
                   value={producto.skuBase ?? ''} onChange={e => actualizarProducto('skuBase', e.target.value)} />
            <p className="text-xs text-muted-foreground">
              El SKU de cada variante se genera automáticamente como {'{código}-{talle}-{color}'}.
            </p>
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Descripción (Opcional)</label>
          <textarea className="w-full flex min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm" 
                    value={producto.descripcion} onChange={e => actualizarProducto('descripcion', e.target.value)} />
        </div>
      </div>
    </div>
  )
}