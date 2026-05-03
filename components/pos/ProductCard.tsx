'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePOS } from '@/context/POSContext'
import type { CartItem } from '@/types/pos'

interface ProductCardProps {
  item: CartItem
}

export function ProductCard({ item }: ProductCardProps) {
  const { updateQuantity, removeFromCart } = usePOS()

  const subtotal = item.price * item.cartQuantity

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm">
      {/* Product thumbnail */}
      <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight text-foreground">
            {item.name}
          </h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeFromCart(item.id)}
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Eliminar producto"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Size and color badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {item.size}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {item.color}
          </Badge>
        </div>

        {/* Quantity controls and subtotal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
              className="size-8"
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.cartQuantity}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
              className="size-8"
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <span className="font-semibold text-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
