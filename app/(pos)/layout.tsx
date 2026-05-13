import { POSProvider } from '@/context/POSContext'
import {TopHeader} from '@/components/layout/TopHeader'

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <POSProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopHeader />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </POSProvider>
  )
}