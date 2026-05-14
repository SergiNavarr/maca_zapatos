'use client'

import { useState, useEffect } from 'react'
import { Barcode} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { productoService, InventarioFisicoDto, TipoMovimientoStock } from '@/lib/services/productoService'

export default function InventarioPage() {
  const { toast } = useToast()
  const [inventario, setInventario] = useState<InventarioFisicoDto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  // Estados para el Modal de Ajuste
  const [modalAbierto, setModalAbierto] = useState(false)
  const [itemSeleccionado, setItemSeleccionado] = useState<InventarioFisicoDto | null>(null)
  const [formAjuste, setFormAjuste] = useState({
    tipoMovimiento: TipoMovimientoStock.Entrada.toString(),
    cantidad: '',
    motivo: ''
  })

  const cargarInventario = () => {
    setLoading(true)
    productoService.obtenerInventario()
      .then(data => setInventario(data))
      .catch(err => console.error("Error", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarInventario() }, [])

  const abrirModalAjuste = (item: InventarioFisicoDto) => {
    setItemSeleccionado(item)
    setFormAjuste({ tipoMovimiento: TipoMovimientoStock.Entrada.toString(), cantidad: '', motivo: '' })
    setModalAbierto(true)
  }

  const guardarAjuste = async () => {
    if (!itemSeleccionado || !formAjuste.cantidad || Number(formAjuste.cantidad) <= 0) return;

    try {
      await productoService.ajustarStock({
        varianteId: itemSeleccionado.varianteId,
        tipoMovimiento: Number(formAjuste.tipoMovimiento),
        cantidad: Number(formAjuste.cantidad),
        motivo: formAjuste.motivo || 'Ajuste manual de inventario'
      })

      toast({ title: "Stock actualizado", description: "El movimiento se registró correctamente." })
      setModalAbierto(false)
      cargarInventario() // Recargamos para ver el nuevo número
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  const filtrados = inventario.filter(item => 
    item.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.productoNombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Control de Inventario</h1>
          <p className="text-sm text-slate-500">Gestión física de cajas y stock por variante.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
        <Barcode className="h-5 w-5 text-slate-400 ml-2" />
        <Input 
          placeholder="Escanear código de barras (SKU)..." 
          className="border-0 shadow-none focus-visible:ring-0 px-2 font-mono"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoFocus 
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
             <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Talle</TableHead>
                <TableHead className="text-center">Color</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Stock Físico</TableHead>
                <TableHead className="text-center w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Cargando stock...</TableCell></TableRow>
              ) : filtrados.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">No hay coincidencias.</TableCell></TableRow>
              ) : (
                filtrados.map((item) => (
                  <TableRow key={item.varianteId}>
                    {/* ... (Todas las celdas de datos iguales) ... */}
                    <TableCell className="font-mono text-xs text-slate-500">{item.sku}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{item.productoNombre}</div>
                      <div className="text-xs text-slate-500">{item.marca} | {item.categoria}</div>
                    </TableCell>
                    <TableCell className="text-center font-bold">{item.talle}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: item.colorHex }} />
                        <span className="text-sm hidden sm:inline-block">{item.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={item.stock > 2 ? 'bg-emerald-50 text-emerald-700' : item.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}>
                         {item.stock > 2 ? 'Óptimo' : item.stock > 0 ? 'Bajo' : 'Sin Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-lg">{item.stock}</TableCell>
                    
                    {/* EL BOTÓN QUE ABRE EL MODAL */}
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => abrirModalAjuste(item)}>
                        Ajustar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL DE AJUSTE */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock</DialogTitle>
          </DialogHeader>
          {itemSeleccionado && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-slate-50 rounded text-sm mb-4">
                <span className="font-bold">{itemSeleccionado.productoNombre}</span><br/>
                Talle {itemSeleccionado.talle} - Color {itemSeleccionado.color}<br/>
                Stock Actual: <span className="font-bold text-indigo-600">{itemSeleccionado.stock}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={formAjuste.tipoMovimiento} onValueChange={(val) => setFormAjuste({...formAjuste, tipoMovimiento: val})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Entrada (Sumar)</SelectItem>
                      <SelectItem value="2">Salida (Restar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input type="number" min="1" value={formAjuste.cantidad} onChange={(e) => setFormAjuste({...formAjuste, cantidad: e.target.value})} placeholder="Ej: 5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo (Opcional)</label>
                <Input value={formAjuste.motivo} onChange={(e) => setFormAjuste({...formAjuste, motivo: e.target.value})} placeholder="Ej: Ingreso por proveedor, Caja rota..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button onClick={guardarAjuste} className="bg-indigo-600 hover:bg-indigo-700">Guardar Ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}