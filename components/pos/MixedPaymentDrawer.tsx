'use client'

import { Banknote, ArrowLeftRight, CreditCard } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePOS } from '@/context/POSContext'
import { cn } from '@/lib/utils'

// 1. Agregamos la interfaz para declarar onSuccess
interface MixedPaymentDrawerProps {
  onSuccess?: () => void
}

const paymentInputs: {
  key: 'efectivo' | 'transferencia' | 'tarjeta'
  label: string
  icon: React.ElementType
}[] = [
  { key: 'efectivo', label: 'Efectivo', icon: Banknote },
  { key: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight },
  { key: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
]

// 2. Le decimos al componente que recibe las props
export function MixedPaymentDrawer({ onSuccess }: MixedPaymentDrawerProps) {
  const {
    isDrawerOpen,
    setDrawerOpen,
    mixedPayment,
    updateMixedPayment,
    total,
    remaining,
    confirmSale,
  } = usePOS()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleInputChange = (
    key: 'efectivo' | 'transferencia' | 'tarjeta',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0
    updateMixedPayment({ [key]: numValue })
  }

  const canConfirm = remaining === 0

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl">Pago Mixto</DrawerTitle>
            <DrawerDescription>
              Ingresá el monto para cada método de pago
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4">
            {/* Total display */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium text-muted-foreground">
                Total a pagar
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(total)}
              </span>
            </div>

            {/* Payment inputs */}
            <div className="space-y-3">
              {paymentInputs.map((input) => {
                const Icon = input.icon
                return (
                  <div key={input.key} className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="size-4 text-muted-foreground" />
                      {input.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={mixedPayment[input.key] || ''}
                        onChange={(e) =>
                          handleInputChange(input.key, e.target.value)
                        }
                        className="h-12 pl-7 text-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Remaining balance */}
            <div
              className={cn(
                'flex items-center justify-between rounded-lg p-3',
                remaining > 0
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-green-500/10 text-green-600'
              )}
            >
              <span className="text-sm font-medium">Restante</span>
              <span className="text-lg font-bold">{formatPrice(remaining)}</span>
            </div>
          </div>

          <DrawerFooter className="flex-row gap-3">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
            </DrawerClose>
            <Button
              className="flex-1"
              disabled={!canConfirm}
              // 3. Pasamos onSuccess a la función confirmSale
              onClick={() => confirmSale(onSuccess)}
            >
              Confirmar
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}