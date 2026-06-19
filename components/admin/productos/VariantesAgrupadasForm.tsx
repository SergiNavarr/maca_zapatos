import { useState } from 'react'
import { ColorDto, TalleDto } from '@/lib/services/maestrasService'
import { GrupoTalle } from '@/hooks/useNuevoProducto'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface VariantesAgrupadasFormProps {
  gruposTalle: GrupoTalle[];
  talles: TalleDto[];
  colores: ColorDto[];
  categoriaSeleccionada: boolean;
  agregarTalle: (talleId: number) => void;
  eliminarTalle: (talleId: number) => void;
  agregarColor: (talleId: number, colorId: number) => void;
  eliminarColor: (talleId: number, colorId: number) => void;
  actualizarStock: (talleId: number, colorId: number, stock: number) => void;
}

export function VariantesAgrupadasForm({
  gruposTalle, talles, colores, categoriaSeleccionada,
  agregarTalle, eliminarTalle, agregarColor, eliminarColor, actualizarStock
}: VariantesAgrupadasFormProps) {
  // Selección transitoria del talle que estoy por agregar (no se persiste ni se aplana).
  const [talleSeleccionado, setTalleSeleccionado] = useState('')

  // Solo talles que todavía NO se agregaron: no se puede repetir un talle.
  const tallesDisponibles = talles.filter(
    t => !gruposTalle.some(g => g.talleId === t.id)
  )

  const handleAgregarTalle = () => {
    const id = Number(talleSeleccionado)
    if (!id) return
    agregarTalle(id)
    setTalleSeleccionado('')
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-xl font-semibold">Talles y Stock</h2>
      </div>

      {/* Agregar talle */}
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Talle</label>
          <select
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            value={talleSeleccionado}
            onChange={e => setTalleSeleccionado(e.target.value)}
            disabled={!categoriaSeleccionada || tallesDisponibles.length === 0}
          >
            <option value="">
              {!categoriaSeleccionada
                ? 'Elegí una categoría primero...'
                : tallesDisponibles.length === 0
                  ? 'No quedan talles por agregar'
                  : 'Elegir talle...'}
            </option>
            {tallesDisponibles.map(t => (
              <option key={t.id} value={t.id}>{t.valor}</option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={handleAgregarTalle}
          disabled={!talleSeleccionado}
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar talle
        </Button>
      </div>

      {/* Bloques de talle */}
      <div className="space-y-4 pt-2">
        {gruposTalle.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            Todavía no agregaste talles.
          </p>
        )}

        {gruposTalle.map(grupo => (
          <BloqueTalle
            key={grupo.talleId}
            grupo={grupo}
            talles={talles}
            colores={colores}
            eliminarTalle={eliminarTalle}
            agregarColor={agregarColor}
            eliminarColor={eliminarColor}
            actualizarStock={actualizarStock}
          />
        ))}
      </div>
    </div>
  )
}

interface BloqueTalleProps {
  grupo: GrupoTalle;
  talles: TalleDto[];
  colores: ColorDto[];
  eliminarTalle: (talleId: number) => void;
  agregarColor: (talleId: number, colorId: number) => void;
  eliminarColor: (talleId: number, colorId: number) => void;
  actualizarStock: (talleId: number, colorId: number, stock: number) => void;
}

function BloqueTalle({
  grupo, talles, colores, eliminarTalle, agregarColor, eliminarColor, actualizarStock
}: BloqueTalleProps) {
  // Selección transitoria del color que estoy por agregar a ESTE talle.
  // Es lo ÚNICO que vive como estado local del bloque; lo persistible (colorId+stock)
  // está en gruposTalle dentro del hook.
  const [colorSeleccionado, setColorSeleccionado] = useState('')

  const talle = talles.find(t => t.id === grupo.talleId)

  // Solo colores que todavía NO se cargaron en ESTE talle: no se repiten dentro del talle.
  const coloresDisponibles = colores.filter(
    c => !grupo.colores.some(col => col.colorId === c.id)
  )

  const handleAgregarColor = () => {
    const id = Number(colorSeleccionado)
    if (!id) return
    agregarColor(grupo.talleId, id)
    setColorSeleccionado('')
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Talle {talle?.valor ?? grupo.talleId}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => eliminarTalle(grupo.talleId)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Eliminar talle
        </Button>
      </div>

      {/* Colores cargados */}
      <div className="space-y-2">
        {grupo.colores.length === 0 && (
          <p className="text-xs text-muted-foreground">Sin colores cargados.</p>
        )}

        {grupo.colores.map(col => {
          const color = colores.find(c => c.id === col.colorId)
          return (
            <div key={col.colorId} className="flex items-end gap-3 p-2 bg-background rounded-md border">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Color</label>
                <div className="flex h-9 items-center gap-2 text-sm">
                  {color?.codigoHex && (
                    <span
                      className="inline-block h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color.codigoHex }}
                    />
                  )}
                  {color?.nombre ?? col.colorId}
                </div>
              </div>

              <div className="w-28 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Stock</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={col.stock}
                  onChange={e => actualizarStock(grupo.talleId, col.colorId, Number(e.target.value))}
                />
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => eliminarColor(grupo.talleId, col.colorId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Agregar color a este talle */}
      <div className="flex items-end gap-3 pt-1">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <select
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            value={colorSeleccionado}
            onChange={e => setColorSeleccionado(e.target.value)}
            disabled={coloresDisponibles.length === 0}
          >
            <option value="">
              {coloresDisponibles.length === 0 ? 'No quedan colores por agregar' : 'Elegir color...'}
            </option>
            {coloresDisponibles.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={handleAgregarColor}
          disabled={!colorSeleccionado}
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar color
        </Button>
      </div>
    </div>
  )
}
