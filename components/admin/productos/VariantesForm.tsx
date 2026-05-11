import { ColorDto, TalleDto } from '@/lib/services/maestrasService'
import { CrearVarianteDto } from '@/lib/services/productoService'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface VariantesFormProps {
  variantes: CrearVarianteDto[];
  talles: TalleDto[];
  colores: ColorDto[];
  categoriaSeleccionada: boolean;
  agregarVariante: () => void;
  eliminarVariante: (index: number) => void;
  actualizarVariante: (index: number, campo: keyof CrearVarianteDto, valor: string | number) => void;
}

export function VariantesForm({
  variantes, talles, colores, categoriaSeleccionada,
  agregarVariante, eliminarVariante, actualizarVariante
}: VariantesFormProps) {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-xl font-semibold">Combinaciones y Stock</h2>
        <Button type="button" variant="outline" size="sm" onClick={agregarVariante}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Variante
        </Button>
      </div>

      <div className="space-y-3 pt-2">
        {variantes.map((variante, index) => (
          <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-3 bg-muted/40 rounded-lg border">
            
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Talle</label>
              <select required className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                      value={variante.talleId} 
                      onChange={e => actualizarVariante(index, 'talleId', e.target.value)}
                      disabled={!categoriaSeleccionada}>
                <option value="">Elegir...</option>
                {talles.map(t => <option key={t.id} value={t.id}>{t.valor}</option>)}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Color</label>
              <select required className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                      value={variante.colorId} 
                      onChange={e => actualizarVariante(index, 'colorId', e.target.value)}>
                <option value="">Elegir...</option>
                {colores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Código SKU</label>
              <input required type="text" placeholder="Ej: NKE-BLC-42" className="w-full h-9 rounded-md border bg-background px-3 text-sm uppercase"
                     value={variante.sku} 
                     onChange={e => actualizarVariante(index, 'sku', e.target.value)} />
            </div>

            <div className="w-24 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Stock</label>
              <input required type="number" min="0" className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                     value={variante.stockInicial} 
                     onChange={e => actualizarVariante(index, 'stockInicial', e.target.value)} />
            </div>

            <Button type="button" variant="destructive" size="icon" className="h-9 w-9 shrink-0" 
                    onClick={() => eliminarVariante(index)} disabled={variantes.length === 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}