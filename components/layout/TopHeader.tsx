'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const routeTitles: Record<string, string> = {
  '/': 'Nueva Venta',
  '/dashboard': 'Resumen',
  '/gastos': 'Gastos',
  '/inventario': 'Inventario',
}

export function TopHeader() {
  const pathname = usePathname()
  const title = routeTitles[pathname] || 'POS'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-4">
        <Button variant="ghost" size="icon" aria-label="Menú">
          <Menu className="size-5" />
        </Button>

        <h1 className="text-lg font-semibold text-foreground">{title}</h1>

        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="size-5" />
        </Button>
      </div>
    </header>
  )
}
