'use client'

import { useMemo } from 'react'
import { SearchBar } from '@/components/pos/SearchBar'
import { ProductCard } from '@/components/pos/ProductCard'
import { CheckoutSection } from '@/components/pos/CheckoutSection'
import { MixedPaymentDrawer } from '@/components/pos/MixedPaymentDrawer'
import { usePOS } from '@/context/POSContext'
import type { ProductVariant } from '@/types/pos'

// Datos de ejemplo (dummy data in Spanish)
const dummyProducts: ProductVariant[] = [
  {
    id: '1',
    name: 'Remera Básica Algodón',
    size: 'M',
    color: 'Negro',
    price: 12500,
    quantity: 15,
  },
  {
    id: '2',
    name: 'Jean Clásico Recto',
    size: '32',
    color: 'Azul Oscuro',
    price: 35000,
    quantity: 8,
  },
  {
    id: '3',
    name: 'Campera de Cuero Sintético',
    size: 'L',
    color: 'Marrón',
    price: 85000,
    quantity: 4,
  },
  {
    id: '4',
    name: 'Zapatillas Urbanas',
    size: '42',
    color: 'Blanco',
    price: 65000,
    quantity: 12,
  },
  {
    id: '5',
    name: 'Buzo con Capucha',
    size: 'XL',
    color: 'Gris',
    price: 28000,
    quantity: 10,
  },
]

export default function POSPage() {
  const { cart, searchQuery, addToCart } = usePOS()

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return dummyProducts
    const query = searchQuery.toLowerCase()
    return dummyProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.color.toLowerCase().includes(query) ||
        product.size.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search bar */}
      <SearchBar />

      {/* Product grid for quick add */}
      {cart.length === 0 && (
        <section aria-label="Productos disponibles">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Agregá productos al carrito
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col items-start gap-1 rounded-lg bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent"
              >
                <span className="text-sm font-medium leading-tight text-foreground">
                  {product.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {product.size} · {product.color}
                </span>
                <span className="mt-1 text-sm font-semibold text-primary">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 0,
                  }).format(product.price)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Cart items */}
      {cart.length > 0 && (
        <section aria-label="Carrito de compras" className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
          </h2>
          {cart.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </section>
      )}

      {/* Checkout section */}
      <CheckoutSection />

      {/* Mixed payment drawer */}
      <MixedPaymentDrawer />
    </div>
  )
}
