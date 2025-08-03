"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import Modal from "@/components/ui/modal"
import Notification from "@/components/ui/notification"
import { Plus, Search, Edit, Trash2, User, Calendar, DollarSign } from "lucide-react"

interface SalaryRecord {
  _id: string
  employeeName: string
  salaryAmount: number
  paidDate: string
  createdAt: string
}

export default function EmployeeSalary() {
  const [records, setRecords] = useState<SalaryRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<SalaryRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null)
  const [formData, setFormData] = useState({
    employeeName: "",
    salaryAmount: "",
    paidDate: new Date().toISOString().split("T")[0]
  })

  // Fetch records
  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/employee-salary")
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
        record.employeeName.toLowerCase().includes(searchLower) ||
        record.salaryAmount.toString().includes(searchLower) ||
        new Date(record.paidDate).toLocaleDateString().includes(searchLower)
      )
    })
    setFilteredRecords(filtered)
  }, [searchTerm, records])

  // Handle form submission for adding new record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/employee-salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setNotificationMessage("Salary record added successfully")
        setIsNotificationOpen(true)
        setFormData({
          employeeName: "",
          salaryAmount: "",
          paidDate: new Date().toISOString().split("T")[0]
        })
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add record")
      }
    } catch (error) {
      console.error("Error adding record:", error)
      alert("Failed to add record")
    }
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRecord) return
    
    try {
      const response = await fetch("/api/employee-salary", {
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
        setNotificationMessage("Salary record updated successfully")
        setIsNotificationOpen(true)
        setSelectedRecord(null)
        setFormData({
          employeeName: "",
          salaryAmount: "",
          paidDate: new Date().toISOString().split("T")[0]
        })
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update record")
      }
    } catch (error) {
      console.error("Error updating record:", error)
      alert("Failed to update record")
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRecord) return
    
    try {
      const response = await fetch(`/api/employee-salary?id=${selectedRecord._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setNotificationMessage("Salary record deleted successfully")
        setIsNotificationOpen(true)
        setSelectedRecord(null)
        fetchRecords() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete record")
      }
    } catch (error) {
      console.error("Error deleting record:", error)
      alert("Failed to delete record")
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Open edit modal
  const openEditModal = (record: SalaryRecord) => {
    setSelectedRecord(record)
    setFormData({
      employeeName: record.employeeName,
      salaryAmount: record.salaryAmount.toString(),
      paidDate: new Date(record.paidDate).toISOString().split("T")[0]
    })
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const openDeleteModal = (record: SalaryRecord) => {
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

  // Format salary with thousands separator
  const formatSalary = (amount: number) => {
    return amount.toLocaleString('en-IN')
  }

  // Calculate summary statistics
  const totalSalary = records.reduce((sum, record) => sum + record.salaryAmount, 0)
  const totalEmployees = records.length
  const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Employee Salary
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage salary payments to employees
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Salary Record
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Employees
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalEmployees}
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
                  Total Salary Paid
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  NPR {formatSalary(totalSalary)}
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
                  Average Salary
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  NPR {formatSalary(Math.round(avgSalary))}
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
            placeholder="Search by employee name, salary amount, or date..."
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

        {/* Salary Records Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Salary (NPR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paid Date (Nepali)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {record.employeeName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.employeeName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: #{index + 1}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        NPR {formatSalary(record.salaryAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatNepaliDate(record.paidDate)}
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

      {/* Add Salary Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Salary Record"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee Name *
            </label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter employee name"
            />
          </div>

          <div>
            <label htmlFor="salaryAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Salary Amount (NPR) *
            </label>
            <input
              type="number"
              id="salaryAmount"
              name="salaryAmount"
              value={formData.salaryAmount}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter salary amount in NPR"
            />
          </div>

          <div>
            <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paid Date *
            </label>
            <input
              type="date"
              id="paidDate"
              name="paidDate"
              value={formData.paidDate}
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
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Salary Record Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Salary Record"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-employeeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee Name *
            </label>
            <input
              type="text"
              id="edit-employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter employee name"
            />
          </div>

          <div>
            <label htmlFor="edit-salaryAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Salary Amount (NPR) *
            </label>
            <input
              type="number"
              id="edit-salaryAmount"
              name="salaryAmount"
              value={formData.salaryAmount}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter salary amount in NPR"
            />
          </div>

          <div>
            <label htmlFor="edit-paidDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paid Date *
            </label>
            <input
              type="date"
              id="edit-paidDate"
              name="paidDate"
              value={formData.paidDate}
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
              Update Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Salary Record"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this salary record? This action cannot be undone.
          </p>
          {selectedRecord && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Employee:</strong> {selectedRecord.employeeName}<br />
                <strong>Salary:</strong> NPR {formatSalary(selectedRecord.salaryAmount)}<br />
                <strong>Paid Date:</strong> {formatNepaliDate(selectedRecord.paidDate)}
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
              Delete Record
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