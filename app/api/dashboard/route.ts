import { NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Define schemas for all collections
const dhaanRecordSchema = new mongoose.Schema({
  farmer: String,
  location: String,
  quantity: Number,
  date: Date
}, { timestamps: true })

const chuiraRecordSchema = new mongoose.Schema({
  batchId: String,
  produced: Number,
  bhuss: Number,
  operatorName: String,
  status: String,
  date: Date
}, { timestamps: true })

const salaryRecordSchema = new mongoose.Schema({
  employeeName: String,
  salaryAmount: Number,
  paidDate: Date
}, { timestamps: true })

const expenseRecordSchema = new mongoose.Schema({
  date: Date,
  category: String,
  description: String,
  amount: Number,
  status: String
}, { timestamps: true })

const salesRecordSchema = new mongoose.Schema({
  orderId: Number,
  date: Date,
  quantity: Number,
  pricePerKg: Number,
  totalPrice: Number,
  customerName: String,
  status: String
}, { timestamps: true })

// Create models
const DhaanRecord = mongoose.models.DhaanRecord || mongoose.model("DhaanRecord", dhaanRecordSchema)
const ChuiraRecord = mongoose.models.ChuiraRecord || mongoose.model("ChuiraRecord", chuiraRecordSchema)
const SalaryRecord = mongoose.models.SalaryRecord || mongoose.model("SalaryRecord", salaryRecordSchema)
const ExpenseRecord = mongoose.models.ExpenseRecord || mongoose.model("ExpenseRecord", expenseRecordSchema)
const SalesRecord = mongoose.models.SalesRecord || mongoose.model("SalesRecord", salesRecordSchema)

// Helper function to format time ago
const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export async function GET() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    // Fetch all data from different collections
    const [
      dhaanRecordsAll,
      chuiraRecordsAll,
      salaryRecordsAll,
      expenseRecordsAll,
      salesRecordsAll
    ] = await Promise.all([
      DhaanRecord.find({}),
      ChuiraRecord.find({}),
      SalaryRecord.find({}),
      ExpenseRecord.find({}),
      SalesRecord.find({})
    ])
    // For recent activity, fetch only the latest 10
    const [
      dhaanRecords,
      chuiraRecords,
      salaryRecords,
      expenseRecords,
      salesRecords
    ] = await Promise.all([
      DhaanRecord.find({}).sort({ createdAt: -1 }).limit(10),
      ChuiraRecord.find({}).sort({ createdAt: -1 }).limit(10),
      SalaryRecord.find({}).sort({ createdAt: -1 }).limit(10),
      ExpenseRecord.find({}).sort({ createdAt: -1 }).limit(10),
      SalesRecord.find({}).sort({ createdAt: -1 }).limit(10)
    ])
    // Calculate totals using *_All arrays
    const totalDhaanCollected = dhaanRecordsAll.reduce((sum, record) => sum + (record.quantity || 0), 0)
    const totalChuiraProduced = chuiraRecordsAll.reduce((sum, record) => sum + (record.produced || 0), 0)
    const totalSalaryExpenses = salaryRecordsAll.reduce((sum, record) => sum + (record.salaryAmount || 0), 0)
    const totalExtraExpenses = expenseRecordsAll.reduce((sum, record) => sum + (record.amount || 0), 0)
    const totalExpenses = totalSalaryExpenses + totalExtraExpenses
    const totalSales = salesRecordsAll.reduce((sum, record) => sum + (record.totalPrice || 0), 0)
    const actualProfit = totalSales - totalExpenses

    // Calculate trends (comparing current month vs previous month)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Current month data
    const currentMonthDhaan = dhaanRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    }).reduce((sum, record) => sum + (record.quantity || 0), 0)

    const currentMonthChuira = chuiraRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    }).reduce((sum, record) => sum + (record.produced || 0), 0)

    const currentMonthExpenses = expenseRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    }).reduce((sum, record) => sum + (record.amount || 0), 0) + 
    salaryRecords.filter(record => {
      const recordDate = new Date(record.paidDate)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    }).reduce((sum, record) => sum + (record.salaryAmount || 0), 0)

    const currentMonthSales = salesRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    }).reduce((sum, record) => sum + (record.totalPrice || 0), 0)

    const currentMonthProfit = currentMonthSales - currentMonthExpenses

    // Previous month data
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const previousMonthDhaan = dhaanRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear
    }).reduce((sum, record) => sum + (record.quantity || 0), 0)

    const previousMonthChuira = chuiraRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear
    }).reduce((sum, record) => sum + (record.produced || 0), 0)

    const previousMonthExpenses = expenseRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear
    }).reduce((sum, record) => sum + (record.amount || 0), 0) + 
    salaryRecords.filter(record => {
      const recordDate = new Date(record.paidDate)
      return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear
    }).reduce((sum, record) => sum + (record.salaryAmount || 0), 0)

    const previousMonthSales = salesRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear
    }).reduce((sum, record) => sum + (record.totalPrice || 0), 0)

    const previousMonthProfit = previousMonthSales - previousMonthExpenses

    // Calculate percentage changes
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const dhaanTrend = calculateTrend(currentMonthDhaan, previousMonthDhaan)
    const chuiraTrend = calculateTrend(currentMonthChuira, previousMonthChuira)
    const expensesTrend = calculateTrend(currentMonthExpenses, previousMonthExpenses)
    const salesTrend = calculateTrend(currentMonthSales, previousMonthSales)
    const profitTrend = calculateTrend(currentMonthProfit, previousMonthProfit)

    // Generate recent activities from all collections
    const activities: Array<{
      action: string
      time: string
      type: 'success' | 'warning' | 'info'
      timestamp: number
    }> = []

    // Add Dhaan activities
    dhaanRecords.forEach(record => {
      activities.push({
        action: `Dhaan collection from ${record.farmer} (${record.quantity} kg)`,
        time: getTimeAgo(new Date(record.createdAt)),
        type: 'success',
        timestamp: new Date(record.createdAt).getTime()
      })
    })

    // Add Chuira activities
    chuiraRecords.forEach(record => {
      activities.push({
        action: `Chuira production batch ${record.batchId} (${record.produced} kg)`,
        time: getTimeAgo(new Date(record.createdAt)),
        type: 'warning',
        timestamp: new Date(record.createdAt).getTime()
      })
    })

    // Add Salary activities
    salaryRecords.forEach(record => {
      activities.push({
        action: `Salary paid to ${record.employeeName} (NPR ${record.salaryAmount?.toLocaleString()})`,
        time: getTimeAgo(new Date(record.createdAt)),
        type: 'info',
        timestamp: new Date(record.createdAt).getTime()
      })
    })

    // Add Expense activities
    expenseRecords.forEach(record => {
      activities.push({
        action: `Expense added: ${record.category} (NPR ${record.amount?.toLocaleString()})`,
        time: getTimeAgo(new Date(record.createdAt)),
        type: 'info',
        timestamp: new Date(record.createdAt).getTime()
      })
    })

    // Add Sales activities
    salesRecords.forEach(record => {
      activities.push({
        action: `Sale to ${record.customerName} (NPR ${record.totalPrice?.toLocaleString()})`,
        time: getTimeAgo(new Date(record.createdAt)),
        type: 'success',
        timestamp: new Date(record.createdAt).getTime()
      })
    })

    // Sort activities by timestamp (most recent first) and take top 5
    const recentActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)

    return NextResponse.json({
      totalDhaanCollected,
      totalChuiraProduced,
      totalExpenses,
      totalSales,
      actualProfit,
      totalSalaryExpenses,
      totalExtraExpenses,
      recentActivities,
      trends: {
        dhaan: { value: Math.abs(dhaanTrend), isPositive: dhaanTrend >= 0 },
        chuira: { value: Math.abs(chuiraTrend), isPositive: chuiraTrend >= 0 },
        expenses: { value: Math.abs(expensesTrend), isPositive: expensesTrend <= 0 }, // Lower expenses is better
        sales: { value: Math.abs(salesTrend), isPositive: salesTrend >= 0 },
        profit: { value: Math.abs(profitTrend), isPositive: profitTrend >= 0 }
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
} 