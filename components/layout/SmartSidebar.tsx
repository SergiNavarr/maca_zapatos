'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, ShoppingCart, Receipt, Package, Settings, LogOut } from 'lucide-react'

const menuItems = [
  { name: 'Caja', href: '/', icon: ShoppingCart, roles: ['Administrador', 'Cajero'] },
  { name: 'Panel', href: '/dashboard', icon: LayoutDashboard, roles: ['Administrador'] },
  { name: 'Catálogo', href: '/productos', icon: Settings, roles: ['Administrador'] },
  { name: 'Stock', href: '/inventario', icon: Package, roles: ['Administrador', 'Cajero'] },
  { name: 'Gastos', href: '/gastos', icon: Receipt, roles: ['Administrador', 'Cajero'] },
]

export function SmartSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null;

  const opcionesPermitidas = menuItems.filter(item => 
    item.roles.includes(user.rol) 
  );

  return (
    <>
      {/* 1. VISTA DESKTOP: Sidebar Lateral (Oculta en celulares y en la Caja registradora) */}
      {pathname && (
        <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col h-screen shrink-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">NavArrow</h2>
            <p className="text-xs text-slate-500 uppercase mt-1">Business Manager</p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {opcionesPermitidas.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link key={item.name} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase">
                {user.nombreUsuario.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white capitalize">{user.nombreUsuario}</p>
                <p className="text-xs text-slate-400 capitalize">{user.rol}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. VISTA MOBILE: Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex items-center justify-around pb-2 pt-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {opcionesPermitidas.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link key={item.name} href={item.href}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          )
        })}
        {/* Botón de salir simplificado para móvil */}
        <button onClick={logout} className="flex flex-col items-center p-2 text-slate-400 hover:text-red-400 transition-colors">
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-medium leading-none">Salir</span>
        </button>
      </nav>
    </>
  )
}