import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const gastos = [
  { id: 1, concepto: 'Alquiler local', monto: 85000, fecha: '01/05/2025' },
  { id: 2, concepto: 'Servicios (luz, agua, gas)', monto: 12500, fecha: '05/05/2025' },
  { id: 3, concepto: 'Compra mercadería', monto: 45000, fecha: '10/05/2025' },
  { id: 4, concepto: 'Materiales de limpieza', monto: 3200, fecha: '12/05/2025' },
]

export default function GastosPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Mayo 2025</p>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          Nuevo Gasto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {gastos.map((gasto) => (
              <li
                key={gasto.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{gasto.concepto}</p>
                  <p className="text-xs text-muted-foreground">{gasto.fecha}</p>
                </div>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(gasto.monto)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="flex items-center justify-between py-4">
          <span className="font-medium">Total del Mes</span>
          <span className="text-lg font-bold text-destructive">
            -{formatCurrency(gastos.reduce((sum, g) => sum + g.monto, 0))}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
