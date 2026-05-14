import { POSProvider } from '@/context/POSContext'
import { SmartSidebar } from '@/components/layout/SmartSidebar'
import { TopHeader } from '@/components/layout/TopHeader' //

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <POSProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        
        <SmartSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopHeader /> 
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>

      </div>
    </POSProvider>
  )
}