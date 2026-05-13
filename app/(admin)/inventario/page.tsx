import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

const productos = [
  { id: 1, nombre: 'Remera Básica', sku: 'REM-001', stock: 25, estado: 'ok' },
  { id: 2, nombre: 'Jean Clásico', sku: 'JEA-002', stock: 8, estado: 'bajo' },
  { id: 3, nombre: 'Campera Invierno', sku: 'CAM-003', stock: 0, estado: 'agotado' },
  { id: 4, nombre: 'Zapatillas Running', sku: 'ZAP-004', stock: 15, estado: 'ok' },
  { id: 5, nombre: 'Buzo Deportivo', sku: 'BUZ-005', stock: 3, estado: 'bajo' },
]

export default function InventarioPage() {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ok':
        return <Badge variant="default" className="bg-green-600">En Stock</Badge>
      case 'bajo':
        return <Badge variant="secondary" className="bg-amber-500 text-white">Stock Bajo</Badge>
      case 'agotado':
        return <Badge variant="destructive">Agotado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar producto o SKU..."
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productos ({productos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Producto</th>
                  <th className="px-4 py-3 text-center font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-xs text-muted-foreground">{producto.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {producto.stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {getEstadoBadge(producto.estado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
