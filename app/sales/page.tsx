"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import Modal from "@/components/ui/modal"
import Notification from "@/components/ui/notification"
import { Plus, Search, Edit, Trash2, User, DollarSign, Calendar, TrendingUp } from "lucide-react"

interface SalesRecord {
  _id: string
  orderId: number
  date: string
  quantity: number
  pricePerKg: number
  totalPrice: number
  customerName: string
  status: "Pending" | "Completed" | "Canceled"
  createdAt: string
}

export default function Sales() {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<SalesRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null)
  const [formData, setFormData] = useState({
    orderId: "",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    pricePerKg: "",
    customerName: "",
    status: "Pending" as "Pending" | "Completed" | "Canceled"
  })

  // Fetch records
  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/sales")
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
        setFilteredRecords(data.records || [])
      }
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // Filter records based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records)
      return
    }

    const filtered = records.filter(record => {
      const searchLower = searchTerm.toLowerCase()
      return (
        record.orderId.toString().includes(searchLower) ||
        record.customerName.toLowerCase().includes(searchLower) ||
        record.status.toLowerCase().includes(searchLower) ||
        new Date(record.date).toLocaleDateString().includes(searchLower)
      )
    })
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  // Generate next order ID
  const generateNextOrderId = () => {
    if (records.length === 0) return 1
    const maxOrderId = Math.max(...records.map(record => record.orderId))
    return maxOrderId + 1
  }

  // Calculate total price
  const calculateTotalPrice = (quantity: string, pricePerKg: string) => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(pricePerKg) || 0
    return qty * price
  }

  // Handle form submission for adding new record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalPrice = calculateTotalPrice(formData.quantity, formData.pricePerKg)
    
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          totalPrice
        }),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setNotificationMessage("Sale added successfully")
        setIsNotificationOpen(true)
        setFormData({
          orderId: "",
          date: new Date().toISOString().split("T")[0],
          quantity: "",
          pricePerKg: "",
          customerName: "",
          status: "Pending"
        })
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add sale")
      }
    } catch (error) {
      console.error("Error adding sale:", error)
      alert("Failed to add sale")
    }
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRecord) return
    
    const totalPrice = calculateTotalPrice(formData.quantity, formData.pricePerKg)
    
    try {
      const response = await fetch("/api/sales", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: selectedRecord._id,
          ...formData,
          totalPrice
        }),
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setNotificationMessage("Sale updated successfully")
        setIsNotificationOpen(true)
        setSelectedRecord(null)
        setFormData({
          orderId: "",
          date: new Date().toISOString().split("T")[0],
          quantity: "",
          pricePerKg: "",
          customerName: "",
          status: "Pending"
        })
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update sale")
      }
    } catch (error) {
      console.error("Error updating sale:", error)
      alert("Failed to update sale")
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRecord) return
    
    try {
      const response = await fetch(`/api/sales?id=${selectedRecord._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setNotificationMessage("Sale deleted successfully")
        setIsNotificationOpen(true)
        setSelectedRecord(null)
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete sale")
      }
    } catch (error) {
      console.error("Error deleting sale:", error)
      alert("Failed to delete sale")
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Open edit modal
  const openEditModal = (record: SalesRecord) => {
    setSelectedRecord(record)
    setFormData({
      orderId: record.orderId.toString(),
      date: new Date(record.date).toISOString().split("T")[0],
      quantity: record.quantity.toString(),
      pricePerKg: record.pricePerKg.toString(),
      customerName: record.customerName,
      status: record.status
    })
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const openDeleteModal = (record: SalesRecord) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  // Format date in Nepali timezone
  const formatNepaliDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Format amount with thousands separator
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-IN')
  }

  // Calculate summary statistics
  const totalSales = records.length
  const totalRevenue = records.reduce((sum, record) => sum + record.totalPrice, 0)
  const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0)
  const completedSales = records.filter(record => record.status === "Completed").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sales
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage product sales
            </p>
          </div>
          <button 
            onClick={() => {
              setFormData(prev => ({ ...prev, orderId: generateNextOrderId().toString() }))
              setIsModalOpen(true)
            }}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sales
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSales}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  NPR {formatAmount(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Quantity
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(totalQuantity)} kg
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Sales
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedSales}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
            placeholder="Search by order ID, customer, status, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Records Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date (Nepali)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price/kg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total (NPR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{record.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatNepaliDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {record.quantity} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        NPR {formatAmount(record.pricePerKg)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        NPR {formatAmount(record.totalPrice)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(record.status)}`}>
                          {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => openEditModal(record)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                          title="Edit record"
                        >
                          <Edit className="h-4 w-4" />
                      </button>
                        <button 
                          onClick={() => openDeleteModal(record)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Sale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order ID *
            </label>
            <input
              type="number"
              id="orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Auto-generated order ID"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity (kg) *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter quantity in kg"
            />
          </div>

          <div>
            <label htmlFor="pricePerKg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price per Kg (NPR) *
            </label>
            <input
              type="number"
              id="pricePerKg"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter price per kg"
            />
        </div>

          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
                </div>

                  <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Total Price Display */}
          {formData.quantity && formData.pricePerKg && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Total Price:</strong> NPR {formatAmount(calculateTotalPrice(formData.quantity, formData.pricePerKg))}
                    </p>
                  </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Add Sale
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Sale"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order ID *
            </label>
            <input
              type="number"
              id="edit-orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter order ID"
            />
          </div>

          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity (kg) *
            </label>
            <input
              type="number"
              id="edit-quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter quantity in kg"
            />
          </div>

          <div>
            <label htmlFor="edit-pricePerKg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price per Kg (NPR) *
            </label>
            <input
              type="number"
              id="edit-pricePerKg"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter price per kg"
            />
          </div>

                  <div>
            <label htmlFor="edit-customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              id="edit-customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
                  </div>

                  <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              id="edit-status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Total Price Display */}
          {formData.quantity && formData.pricePerKg && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Total Price:</strong> NPR {formatAmount(calculateTotalPrice(formData.quantity, formData.pricePerKg))}
                    </p>
                  </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Update Sale
            </button>
                </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Sale"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this sale? This action cannot be undone.
          </p>
          {selectedRecord && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Order ID:</strong> #{selectedRecord.orderId}<br />
                <strong>Date:</strong> {formatNepaliDate(selectedRecord.date)}<br />
                <strong>Quantity:</strong> {selectedRecord.quantity} kg<br />
                <strong>Price per Kg:</strong> NPR {formatAmount(selectedRecord.pricePerKg)}<br />
                <strong>Total:</strong> NPR {formatAmount(selectedRecord.totalPrice)}<br />
                <strong>Customer:</strong> {selectedRecord.customerName}<br />
                <strong>Status:</strong> {selectedRecord.status}
              </p>
              </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Sale
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Notification */}
      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title="Success!"
        message={notificationMessage}
        type="success"
      />
    </DashboardLayout>
  )
} 