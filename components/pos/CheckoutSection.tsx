'use client'

import { Banknote, CreditCard, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePOS } from '@/context/POSContext'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/pos'

const paymentMethods: {
  id: PaymentMethod | 'mixto'
  label: string
  icon: React.ElementType
}[] = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight },
  { id: 'mixto', label: 'Mixto', icon: CreditCard },
]

export function CheckoutSection() {
  const { total, selectedPaymentMethod, setPaymentMethod, confirmSale, cart } =
    usePOS()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const isDisabled = cart.length === 0

  return (
    <div className="space-y-4 rounded-lg bg-card p-4 shadow-sm">
      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Total</span>
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(total)}
        </span>
      </div>

      {/* Payment methods */}
      <div className="grid grid-cols-3 gap-2">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedPaymentMethod === method.id
          return (
            <Button
              key={method.id}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => setPaymentMethod(method.id)}
              disabled={isDisabled}
              className={cn(
                'flex h-auto flex-col gap-1 py-3',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs">{method.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Confirm button */}
      <Button
        size="lg"
        className="w-full text-base font-semibold"
        disabled={isDisabled || !selectedPaymentMethod}
        onClick={confirmSale}
      >
        Confirmar Venta
      </Button>
    </div>
  )
}
