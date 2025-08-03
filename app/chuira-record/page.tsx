"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import Modal from "@/components/ui/modal"
import Notification from "@/components/ui/notification"
import { Plus, Search, Edit, Trash2, ChevronDown, User, DollarSign, Calendar } from "lucide-react"

interface ChuiraRecord {
  _id: string
  batchId: string
  produced: number
  bhuss: number
  operatorName: string
  status: "In Progress" | "Completed" | "Failed"
  date: string
  createdAt: string
}

export default function ChuiraRecord() {
  const [records, setRecords] = useState<ChuiraRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ChuiraRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<ChuiraRecord | null>(null)
  const [formData, setFormData] = useState({
    batchId: "",
    produced: "",
    bhuss: "",
    operatorName: "",
    status: "In Progress" as "In Progress" | "Completed" | "Failed",
    date: new Date().toISOString().split("T")[0]
  })

  // Generate batch ID
  const generateBatchId = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `CH-${timestamp}`
  }

  // Fetch records
  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/chuira-records")
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
        record.batchId.toLowerCase().includes(searchLower) ||
        record.operatorName.toLowerCase().includes(searchLower) ||
        record.status.toLowerCase().includes(searchLower) ||
        new Date(record.date).toLocaleDateString().includes(searchLower)
      )
    })
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  // Handle form submission for adding new record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/chuira-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setNotificationMessage("Chuira batch added successfully")
        setIsNotificationOpen(true)
        setFormData({
          batchId: "",
          produced: "",
          bhuss: "",
          operatorName: "",
          status: "In Progress",
          date: new Date().toISOString().split("T")[0]
        })
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add batch")
      }
    } catch (error) {
      console.error("Error adding batch:", error)
      alert("Failed to add batch")
    }
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRecord) return
    
    try {
      const response = await fetch("/api/chuira-records", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: selectedRecord._id,
          ...formData
        }),
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setNotificationMessage("Chuira batch updated successfully")
        setIsNotificationOpen(true)
        setSelectedRecord(null)
        setFormData({
          batchId: "",
          produced: "",
          bhuss: "",
          operatorName: "",
          status: "In Progress",
          date: new Date().toISOString().split("T")[0]
        })
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update batch")
      }
    } catch (error) {
      console.error("Error updating batch:", error)
      alert("Failed to update batch")
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRecord) return
    
    try {
      const response = await fetch(`/api/chuira-records?id=${selectedRecord._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setNotificationMessage("Chuira batch deleted successfully")
        setIsNotificationOpen(true)
        setSelectedRecord(null)
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete batch")
      }
    } catch (error) {
      console.error("Error deleting batch:", error)
      alert("Failed to delete batch")
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
  const openEditModal = (record: ChuiraRecord) => {
    setSelectedRecord(record)
    setFormData({
      batchId: record.batchId,
      produced: record.produced.toString(),
      bhuss: record.bhuss.toString(),
      operatorName: record.operatorName,
      status: record.status,
      date: new Date(record.date).toISOString().split("T")[0]
    })
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const openDeleteModal = (record: ChuiraRecord) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  // Format date in Nepali timezone
  const formatNepaliDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Calculate summary statistics
  const totalProduced = records.reduce((sum, record) => sum + record.produced, 0)
  const totalBhuss = records.reduce((sum, record) => sum + record.bhuss, 0)
  const totalBatches = records.length
  const completedBatches = records.filter(record => record.status === "Completed").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chuira Record
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track batch-level chuira production data
            </p>
          </div>
          <button 
            onClick={() => {
              setFormData(prev => ({ ...prev, batchId: generateBatchId() }))
              setIsModalOpen(true)
            }}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Batches
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalBatches}
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
                  Total Chuira Produced
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalProduced.toLocaleString()} kg
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
                  Total Bhuss
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalBhuss.toLocaleString()} kg
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
                  Completed Batches
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedBatches}
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
            placeholder="Search by batch ID, operator, status, or date..."
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
                    Batch ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date (Nepali)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produced (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Bhuss (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Operator
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
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {record.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatNepaliDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {record.produced} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {record.bhuss} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.operatorName}
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

      {/* Add Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Chuira Batch"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Batch ID *
            </label>
            <input
              type="text"
              id="batchId"
              name="batchId"
              value={formData.batchId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Auto-generated batch ID"
            />
          </div>

          <div>
            <label htmlFor="produced" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Produced (kg) *
            </label>
            <input
              type="number"
              id="produced"
              name="produced"
              value={formData.produced}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter produced quantity in kg"
            />
          </div>

          <div>
            <label htmlFor="bhuss" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bhuss (kg) *
            </label>
            <input
              type="number"
              id="bhuss"
              name="bhuss"
              value={formData.bhuss}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter bhuss quantity in kg"
            />
          </div>

          <div>
            <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Operator Name *
            </label>
            <input
              type="text"
              id="operatorName"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter operator name"
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
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
              Add Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Chuira Batch"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-batchId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Batch ID *
            </label>
            <input
              type="text"
              id="edit-batchId"
              name="batchId"
              value={formData.batchId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter batch ID"
            />
          </div>

          <div>
            <label htmlFor="edit-produced" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Produced (kg) *
            </label>
            <input
              type="number"
              id="edit-produced"
              name="produced"
              value={formData.produced}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter produced quantity in kg"
            />
          </div>

          <div>
            <label htmlFor="edit-bhuss" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bhuss (kg) *
            </label>
            <input
              type="number"
              id="edit-bhuss"
              name="bhuss"
              value={formData.bhuss}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter bhuss quantity in kg"
            />
          </div>

          <div>
            <label htmlFor="edit-operatorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Operator Name *
            </label>
            <input
              type="text"
              id="edit-operatorName"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter operator name"
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
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
              Update Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Chuira Batch"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this batch? This action cannot be undone.
          </p>
          {selectedRecord && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Batch ID:</strong> {selectedRecord.batchId}<br />
                <strong>Produced:</strong> {selectedRecord.produced} kg<br />
                <strong>Bhuss:</strong> {selectedRecord.bhuss} kg<br />
                <strong>Operator:</strong> {selectedRecord.operatorName}<br />
                <strong>Status:</strong> {selectedRecord.status}<br />
                <strong>Date:</strong> {formatNepaliDate(selectedRecord.date)}
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
              Delete Batch
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