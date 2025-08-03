"use client"

import { useState, useEffect } from "react"
import DashboardLayout from '@/components/layout/dashboard-layout'
import KPICard from '@/components/ui/kpi-card'
import ProfitChart from '@/components/ui/profit-chart'
import { Wheat, Package, DollarSign, TrendingUp, Calculator } from 'lucide-react'

interface DashboardData {
  totalDhaanCollected: number
  totalChuiraProduced: number
  totalExpenses: number
  totalSales: number
  actualProfit: number
  totalSalaryExpenses: number // added
  totalExtraExpenses: number  // added
  recentActivities: Array<{
    action: string
    time: string
    type: 'success' | 'warning' | 'info'
    timestamp: number
  }>
  trends: {
    dhaan: { value: number; isPositive: boolean }
    chuira: { value: number; isPositive: boolean }
    expenses: { value: number; isPositive: boolean }
    sales: { value: number; isPositive: boolean }
    profit: { value: number; isPositive: boolean }
  }
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format numbers with thousands separators
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN')
  }

  // Format currency with NPR symbol
  const formatCurrency = (num: number) => {
    return `NPR ${num.toLocaleString('en-IN')}`
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to Jattis Agro management dashboard
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 lg:p-6 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to Jattis Agro management dashboard
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          <KPICard
            title="Total Dhaan Collected"
            value={dashboardData ? `${formatNumber(dashboardData.totalDhaanCollected)} kg` : "0 kg"}
            icon={Wheat}
            trend={dashboardData?.trends.dhaan || { value: 0, isPositive: true }}
            color="agricultural"
          />
          <KPICard
            title="Total Chuira Produced"
            value={dashboardData ? `${formatNumber(dashboardData.totalChuiraProduced)} kg` : "0 kg"}
            icon={Package}
            trend={dashboardData?.trends.chuira || { value: 0, isPositive: true }}
            color="primary"
          />
          <KPICard
            title="Total Expenses"
            value={dashboardData ? formatCurrency(dashboardData.totalExpenses) : "NPR 0"}
            icon={DollarSign}
            trend={dashboardData?.trends.expenses || { value: 0, isPositive: false }}
            color="red"
          />
          <KPICard
            title="Total Sales"
            value={dashboardData ? formatCurrency(dashboardData.totalSales) : "NPR 0"}
            icon={TrendingUp}
            trend={dashboardData?.trends.sales || { value: 0, isPositive: true }}
            color="blue"
          />
          <KPICard
            title="Actual Profit"
            value={dashboardData ? formatCurrency(dashboardData.actualProfit) : "NPR 0"}
            icon={Calculator}
            trend={dashboardData?.trends.profit || { value: 0, isPositive: true }}
            color="purple"
          />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfitChart 
            totalExpenses={dashboardData?.totalExpenses || 0}
            actualProfit={dashboardData?.actualProfit || 0}
            totalSales={dashboardData?.totalSales || 0}
            totalDhaanCollected={dashboardData?.totalDhaanCollected || 0}
            totalChuiraProduced={dashboardData?.totalChuiraProduced || 0}
            salaryExpenses={dashboardData?.totalSalaryExpenses || 0}
            extraExpenses={dashboardData?.totalExtraExpenses || 0}
          />
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Recent Activity
            </h3>
            <div className="space-y-5">
              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${item.type === 'success' ? 'bg-green-500' : 
                        item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}
                    `} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No recent activities found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              This Month's Growth
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dashboardData?.trends.profit.isPositive ? '+' : '-'}{dashboardData?.trends.profit.value || 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Profit growth vs last month
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Total Revenue
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dashboardData ? formatCurrency(dashboardData.totalSales) : "NPR 0"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              All-time sales revenue
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Profit Margin
            </h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {dashboardData && dashboardData.totalSales > 0 
                ? `${Math.round((dashboardData.actualProfit / dashboardData.totalSales) * 100)}%`
                : '0%'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Profit as % of sales
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 