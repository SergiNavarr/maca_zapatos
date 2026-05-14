'use client'

import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import { LogOut, Store, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Mapeo dinámico para saber en qué sección estamos
  const getPageTitle = () => {
    if (pathname === '/') return 'Punto de Venta'
    if (pathname.startsWith('/dashboard')) return 'Panel de Control'
    if (pathname.startsWith('/productos')) return 'Catálogo'
    if (pathname.startsWith('/inventario')) return 'Inventario'
    if (pathname.startsWith('/gastos')) return 'Gastos de Caja'
    return 'NavArrow'
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        {/* Ícono representativo en lugar del botón de menú */}
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
          <Store className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-slate-800">
          {getPageTitle()}
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* Ficha del usuario (Se oculta en celulares para priorizar espacio) */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground border-r border-slate-200 pr-4">
            <UserCircle className="h-5 w-5" />
            <span className="capitalize">{user.nombreUsuario}</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 capitalize font-semibold">
              {user.rol}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout} 
            className="text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      )}
    </header>
  )
}