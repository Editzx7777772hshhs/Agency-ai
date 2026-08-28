import { useState } from 'react'
import { Sidebar, MobileDrawer } from './Sidebar'
import { Navbar } from './Navbar'
import { ErrorBoundary } from './ErrorBoundary'

export function AppShell({ title, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar title={title} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
