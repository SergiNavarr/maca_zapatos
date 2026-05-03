'use client'

import { Search, ScanBarcode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePOS } from '@/context/POSContext'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = usePOS()

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar producto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-10 pr-4"
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        className="size-11 shrink-0"
        aria-label="Escanear código de barras"
      >
        <ScanBarcode className="size-5" />
      </Button>
    </div>
  )
}
