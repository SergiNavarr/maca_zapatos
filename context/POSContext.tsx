'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { CartItem, ProductVariant, PaymentMethod, MixedPayment } from '@/types/pos'
import { ventaService } from '@/lib/services/ventaService'
import { useToast } from '@/hooks/use-toast'

interface POSContextType {
  cart: CartItem[]
  searchQuery: string
  selectedPaymentMethod: PaymentMethod | 'mixto' | null
  mixedPayment: MixedPayment
  isDrawerOpen: boolean
  total: number
  remaining: number
  addToCart: (product: ProductVariant) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setSearchQuery: (query: string) => void
  setPaymentMethod: (method: PaymentMethod | 'mixto' | null) => void
  updateMixedPayment: (payment: Partial<MixedPayment>) => void
  setDrawerOpen: (open: boolean) => void
  clearCart: () => void
  confirmSale: (onSuccess?: () => void) => Promise<void>
}

const POSContext = createContext<POSContextType | undefined>(undefined)

export function POSProvider({ children }: { children: ReactNode }) {

  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethod | 'mixto' | null
  >(null)
  const [mixedPayment, setMixedPayment] = useState<MixedPayment>({
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0)
  }, [cart])

  const remaining = useMemo(() => {
    const paid = mixedPayment.efectivo + mixedPayment.transferencia + mixedPayment.tarjeta
    return Math.max(0, total - paid)
  }, [total, mixedPayment])

 const addToCart = useCallback((product: ProductVariant) => {
    // 1. Buscamos si ya está en el carrito leyendo el estado actual
    const existing = cart.find((item) => item.id === product.id);
    const currentQty = existing ? existing.cartQuantity : 0;

    // 2. Validamos AFUERA del setCart
    if (currentQty >= product.quantity) {
      toast({
        title: "Stock máximo alcanzado",
        description: `Solo hay ${product.quantity} unidades disponibles.`,
        variant: "destructive",
      });
      return; // no se actualiza el estado
    }

    // 3. Si todo está bien, actualizamos el estado de forma limpia
    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  }, [cart, toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    // Validamos AFUERA del setCart
    if (quantity > item.quantity) {
      toast({
        title: "Límite alcanzado",
        description: `No puedes agregar más de ${item.quantity} unidades.`,
        variant: "destructive",
      });
      return;
    }

    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== productId);
      }
      return prev.map((i) =>
        i.id === productId ? { ...i, cartQuantity: quantity } : i
      );
    });
  }, [cart, toast]);

  const setPaymentMethod = useCallback(
    (method: PaymentMethod | 'mixto' | null) => {
      setSelectedPaymentMethod(method)
      if (method === 'mixto') {
        setIsDrawerOpen(true)
      }
    },
    []
  )

  const updateMixedPayment = useCallback((payment: Partial<MixedPayment>) => {
    setMixedPayment((prev) => ({ ...prev, ...payment }))
  }, [])

  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open)
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedPaymentMethod(null)
    setMixedPayment({ efectivo: 0, transferencia: 0, tarjeta: 0 })
  }, [])

  const confirmSale = useCallback(async (onSuccess?: () => void) => {
    if (cart.length === 0) return;
    if (!selectedPaymentMethod) {
        toast({
        title: "Atención",
        description: "Por favor selecciona un método de pago antes de confirmar.",
        variant: "destructive", 
      });
        return;
    }

    try {
      // 1. Llamamos a nuestra API de C#
      const respuesta = await ventaService.registrarVenta(cart, total, selectedPaymentMethod);
      
      // 2. Limpiamos el carrito y cerramos el cajón
      clearCart();
      setIsDrawerOpen(false);
      
      toast({
        title: "¡Venta Exitosa!",
        description: `El ticket #${respuesta.ventaId} se ha registrado correctamente.`,
        className: "bg-emerald-600 text-white border-none", 
      });

      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error al registrar la venta:", error);
      toast({
        title: "Error en la Venta",
        description: error.message || "Hubo un error al procesar el ticket.",
        variant: "destructive",
      });
    }
  }, [cart, total, selectedPaymentMethod, clearCart, toast]);

  const value = useMemo(
    () => ({
      cart,
      searchQuery,
      selectedPaymentMethod,
      mixedPayment,
      isDrawerOpen,
      total,
      remaining,
      addToCart,
      removeFromCart,
      updateQuantity,
      setSearchQuery,
      setPaymentMethod,
      updateMixedPayment,
      setDrawerOpen,
      clearCart,
      confirmSale,
    }),
    [
      cart,
      searchQuery,
      selectedPaymentMethod,
      mixedPayment,
      isDrawerOpen,
      total,
      remaining,
      addToCart,
      removeFromCart,
      updateQuantity,
      setSearchQuery,
      setPaymentMethod,
      updateMixedPayment,
      setDrawerOpen,
      clearCart,
      confirmSale,
    ]
  )

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export function usePOS() {
  const context = useContext(POSContext)
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider')
  }
  return context
}