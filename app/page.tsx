'use client'

import { useMemo, useState, useEffect } from 'react'
import { SearchBar } from '@/components/pos/SearchBar'
import { ProductCard } from '@/components/pos/ProductCard'
import { CheckoutSection } from '@/components/pos/CheckoutSection'
import { usePOS } from '@/context/POSContext'
import { productoService } from '@/lib/services/productoService'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, PackageSearch } from 'lucide-react'
import type { ProductVariant } from '@/types/pos'

export default function POSPage() {
  const { cart, searchQuery, addToCart, total } = usePOS()
  const [productos, setProductos] = useState<ProductVariant[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    productoService.obtenerProductosParaPOS().then(data => {
      setProductos(data)
      setCargando(false)
    })
  }, [])

  // 1. Extraemos categorías únicas para los Tabs
  const categorias = useMemo(() => {
    const cats = productos.map(p => p.category)
    return ['Todas', ...Array.from(new Set(cats))]
  }, [productos])

  // 2. Filtro combinado: Búsqueda + Categoría
  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoriaActiva === 'Todas' || p.category === categoriaActiva
      return matchSearch && matchCat
    })
  }, [searchQuery, categoriaActiva, productos])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO */}
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <SearchBar />
          
          {/* Tabs de Categorías */}
          {!cargando && (
            <Tabs value={categoriaActiva} onValueChange={setCategoriaActiva} className="w-full">
              <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start">
                {categorias.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="px-4 py-2">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group relative flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-all hover:ring-2 hover:ring-primary active:scale-95"
            >
              <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {product.image ? (
                   <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{product.brand}</span>
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.size} · {product.color}</p>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-sm font-bold text-primary">${product.price.toLocaleString()}</span>
                   <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Stock: {product.quantity}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* SECCIÓN DERECHA: CARRITO (Escritorio) */}
      <aside className="hidden lg:flex w-[400px] border-l bg-card flex-col sticky top-0 h-screen">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-bold text-xl">Ticket</h2>
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map(item => <ProductCard key={item.id} item={item} />)}
        </div>
        <div className="p-6 border-t bg-muted/30">
          <CheckoutSection />
        </div>
      </aside>

      {/* CARRITO FLOTANTE (Móvil) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full h-16 w-16 shadow-2xl flex flex-col gap-0">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-[10px]">${total.toLocaleString()}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0">
            <div className="p-6 h-full flex flex-col">
               <h2 className="text-lg font-bold mb-4">Carrito de Ventas</h2>
               <div className="flex-1 overflow-y-auto mb-4">
                 {cart.map(item => <ProductCard key={item.id} item={item} />)}
               </div>
               <CheckoutSection />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}