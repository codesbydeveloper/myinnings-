import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import MobileMenu from './MobileMenu'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="min-h-svh overflow-x-hidden bg-slate-50">
      <Sidebar />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64 print:pl-0">
        <Header onMenuOpen={() => setMobileOpen(true)} />
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 print:px-0 print:py-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
