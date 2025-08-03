"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ProfitChartProps {
  totalExpenses?: number
  actualProfit?: number
  totalSales?: number
  totalDhaanCollected?: number
  totalChuiraProduced?: number
  salaryExpenses?: number
  extraExpenses?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {data.name}
        </p>
        <p className={`text-sm ${data.payload.color === '#22c55e' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          NPR {data.value?.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.payload.percentage}% of total
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center space-x-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ProfitChart({ 
  totalExpenses = 0, 
  actualProfit = 0, 
  totalSales = 0,
  totalDhaanCollected = 0,
  totalChuiraProduced = 0,
  salaryExpenses = 0,
  extraExpenses = 0
}: ProfitChartProps) {
  // Create comprehensive data array with multiple categories
  const data = [
    {
      name: 'Actual Profit',
      value: actualProfit,
      color: '#22c55e',
      unit: 'NPR',
      percentage: totalSales > 0 ? Math.round((actualProfit / totalSales) * 100) : 0
    },
    {
      name: 'Salary Expenses',
      value: salaryExpenses,
      color: '#ef4444',
      unit: 'NPR',
      percentage: totalSales > 0 ? Math.round((salaryExpenses / totalSales) * 100) : 0
    },
    {
      name: 'Extra Expenses',
      value: extraExpenses,
      color: '#f59e0b',
      unit: 'NPR',
      percentage: totalSales > 0 ? Math.round((extraExpenses / totalSales) * 100) : 0
    }
  ]
  // Filter out zero values to avoid empty pie slices
  const chartData = data.filter(item => item.value > 0)
  // Calculate total for percentage calculations
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  // Update percentages based on actual total
  chartData.forEach(item => {
    item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Profit vs Expenses
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Breakdown of total revenue allocation
        </p>
      </div>
      
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <CustomLegend payload={chartData.map((entry, index) => ({
            value: entry.name,
            color: entry.color,
            type: 'circle'
          }))} />
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                NPR {actualProfit.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                NPR {totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 border-4 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-sm">No Data</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add some expenses and sales to see the breakdown
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 