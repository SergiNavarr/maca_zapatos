export interface ProductVariant {
  id: string
  name: string
  brand: string
  category: string
  size: string
  color: string
  price: number
  quantity: number
  image?: string
}

export interface CartItem extends ProductVariant {
  cartQuantity: number
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta'

export interface MixedPayment {
  efectivo: number
  transferencia: number
  tarjeta: number
}

export interface POSState {
  cart: CartItem[]
  searchQuery: string
  selectedPaymentMethod: PaymentMethod | 'mixto' | null
  mixedPayment: MixedPayment
  isDrawerOpen: boolean
}
