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
      {/* Combined Container - Both sidebar and main content start from same top */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Main Content - Same container as sidebar */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 