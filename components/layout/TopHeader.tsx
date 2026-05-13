'use client'

import { useAuth } from '@/context/AuthContext'
import { LogOut, Menu, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function TopHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        {/* Transformamos el ícono en un botón de navegación hacia el Dashboard/Gastos */}
        <Link href="/dashboard" className="flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 p-2 transition-colors">
          <Menu className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold tracking-tight">Punto de Venta</h1>
      </div>

      {/* Si hay un usuario logueado, mostramos sus datos y el botón de salir */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground border-r pr-4">
            <UserCircle className="h-5 w-5" />
            <span>{user.nombreUsuario}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {user.rol}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout} 
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      )}
    </header>
  )
}