'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { SearchBar } from '@/components/pos/SearchBar'
import { ProductCard } from '@/components/pos/ProductCard'
import { CheckoutSection } from '@/components/pos/CheckoutSection'
import { MixedPaymentDrawer } from '@/components/pos/MixedPaymentDrawer'
import { usePOS } from '@/context/POSContext'
import { productoService } from '@/lib/services/productoService'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, PackageSearch } from 'lucide-react'
import type { ProductVariant } from '@/types/pos'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function POSPage() {
  // 1. LOS HOOKS 
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const { cart, searchQuery, addToCart, total } = usePOS()
  const [productos, setProductos] = useState<ProductVariant[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [cargando, setCargando] = useState(true)

  // 2. EXTRAEMOS LA LÓGICA A UNA FUNCIÓN REUTILIZABLE
  const cargarProductos = useCallback(() => {
    setCargando(true)
    productoService.obtenerProductosParaPOS()
        .then(data => {
            setProductos(data)
            setCargando(false)
        })
        .catch(err => {
            console.error("Error cargando productos:", err);
            setCargando(false);
        })
  }, [])

  // 3. TODOS LOS EFECTOS Y MEMOS
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Solo pedimos productos si ya confirmamos que hay sesión
    if (isAuthenticated) {
        cargarProductos()
    }
  }, [isAuthenticated, cargarProductos])

  const categorias = useMemo(() => {
    const cats = productos.map(p => p.category)
    return ['Todas', ...Array.from(new Set(cats))]
  }, [productos])

  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoriaActiva === 'Todas' || p.category === categoriaActiva
      return matchSearch && matchCat
    })
  }, [searchQuery, categoriaActiva, productos])


  // 4. RECIÉN ACÁ VAN LOS RETURNS CONDICIONALES
  // Pantalla de carga suave mientras verifica el token o carga la página
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-muted">
         <span className="text-muted-foreground animate-pulse">Cargando sistema...</span>
      </div>
    )
  }

  // 5. RETURN PRINCIPAL DE LA VISTA
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
          {filteredProducts.map((product) => {
            // 1. Calculamos el stock dinámico
            const itemEnCarrito = cart.find(item => item.id === product.id);
            const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cartQuantity : 0;
            const stockDisponible = product.quantity - cantidadEnCarrito;
            
            const isAgotado = stockDisponible <= 0;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isAgotado} // Se bloquea automáticamente si bajó a 0
                className={`group relative flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-all ${
                  isAgotado 
                    ? 'opacity-50 cursor-not-allowed grayscale' 
                    : 'hover:ring-2 hover:ring-primary active:scale-95'
                }`}
              >
                <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
                  {isAgotado && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                      <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold uppercase">
                        Agotado
                      </span>
                    </div>
                  )}
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
                     <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        isAgotado ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-700'
                     }`}>
                       Stock: {stockDisponible}
                     </span>
                  </div>
                </div>
              </button>
            )
          })}
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
          <CheckoutSection onSuccess={cargarProductos} />
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
               
               <SheetHeader className="text-left mb-4">
                 <SheetTitle className="text-lg font-bold">Carrito de Ventas</SheetTitle>
                 <SheetDescription className="sr-only">
                   Revisa los artículos de tu ticket antes de proceder al cobro.
                 </SheetDescription>
               </SheetHeader>

               <div className="flex-1 overflow-y-auto mb-4">
                 {cart.map(item => <ProductCard key={item.id} item={item} />)}
               </div>
               <CheckoutSection onSuccess={cargarProductos} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* DRAWER DE PAGO MIXTO */}
      <MixedPaymentDrawer onSuccess={cargarProductos} />

    </div>
  )
}