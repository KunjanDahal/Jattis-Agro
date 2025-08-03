"use client"

import { useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface NotificationProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "success" | "error"
}

export default function Notification({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "success" 
}: NotificationProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const bgColor = type === "success" 
    ? "bg-green-50 dark:bg-green-900/20" 
    : "bg-red-50 dark:bg-red-900/20"
  
  const borderColor = type === "success" 
    ? "border-green-200 dark:border-green-800" 
    : "border-red-200 dark:border-red-800"
  
  const iconColor = type === "success" 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400"

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
