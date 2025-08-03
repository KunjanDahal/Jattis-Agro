"use client"

import { useState } from 'react'
import Sidebar from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="mt-16">
        <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
          {children}
        </div>
      </main>
    </div>
  )
} 