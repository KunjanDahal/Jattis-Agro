import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'agricultural' | 'blue' | 'red' | 'purple'
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    icon: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-800'
  },
  agricultural: {
    bg: 'bg-agricultural-50 dark:bg-agricultural-900/20',
    icon: 'text-agricultural-600 dark:text-agricultural-400',
    border: 'border-agricultural-200 dark:border-agricultural-800'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  }
}

export default function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary' 
}: KPICardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-2xl shadow-md border ${colors.border}
      p-5 lg:p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`
                text-sm font-medium
                ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              `}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                from last month
              </span>
            </div>
          )}
        </div>
        <div className={`
          p-2.5 lg:p-3 rounded-xl ${colors.bg}
        `}>
          <Icon className={`h-7 w-7 lg:h-8 lg:w-8 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
} 