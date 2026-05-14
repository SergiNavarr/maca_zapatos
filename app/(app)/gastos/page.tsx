'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Receipt } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { gastoService, GastoDto } from '@/lib/services/gastoService'

export default function GastosPage() {
  const { toast } = useToast()
  const [gastos, setGastos] = useState<GastoDto[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nuevoConcepto, setNuevoConcepto] = useState('')
  const [nuevoMonto, setNuevoMonto] = useState('')

  const fechaActual = new Date()
  const mesActual = fechaActual.getMonth() + 1
  const anioActual = fechaActual.getFullYear()

  const cargarGastos = () => {
    setLoading(true)
    gastoService.obtenerGastosMes(mesActual, anioActual)
      .then(data => setGastos(data))
      .catch(err => console.error("Error al cargar gastos:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarGastos()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleGuardarGasto = async () => {
    if (!nuevoConcepto || !nuevoMonto || Number(nuevoMonto) <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Completá todos los campos correctamente." })
      return
    }

    try {
      await gastoService.crearGasto({
        concepto: nuevoConcepto,
        monto: Number(nuevoMonto)
      })
      toast({ title: "Éxito", description: "Gasto registrado en la caja." })
      setModalAbierto(false)
      setNuevoConcepto('')
      setNuevoMonto('')
      cargarGastos() // Refresca la lista
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  const totalMes = gastos.reduce((sum, g) => sum + g.monto, 0)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gastos de Caja</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {fechaActual.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => setModalAbierto(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Gasto
        </Button>
      </div>

      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <Receipt className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-600">Egresos Totales del Mes</span>
          </div>
          <span className="text-3xl font-black text-red-600">
            -{formatCurrency(totalMes)}
          </span>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="text-base font-bold text-slate-800">Detalle de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Cargando gastos...</div>
          ) : gastos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay gastos registrados este mes.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {gastos.map((gasto) => (
                <li key={gasto.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">{gasto.concepto}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(gasto.fechaCreacion).toLocaleDateString('es-AR')} • Registrado por: {gasto.nombreUsuario}
                    </p>
                  </div>
                  <span className="font-bold text-red-600 text-lg">
                    -{formatCurrency(gasto.monto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* MODAL NUEVO GASTO */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Salida de Dinero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Concepto o Descripción</label>
              <Input 
                placeholder="Ej: Pago a proveedor de bolsas, Artículos de limpieza..." 
                value={nuevoConcepto} 
                onChange={(e) => setNuevoConcepto(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monto a retirar ($)</label>
              <Input 
                type="number" 
                placeholder="Ej: 15000" 
                value={nuevoMonto} 
                onChange={(e) => setNuevoMonto(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button onClick={handleGuardarGasto} className="bg-indigo-600 hover:bg-indigo-700">Confirmar Retiro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}