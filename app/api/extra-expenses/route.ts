import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

const expenseRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, required: true, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true })

const ExpenseRecord = mongoose.models.ExpenseRecord || mongoose.model("ExpenseRecord", expenseRecordSchema)

export async function GET() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const records = await ExpenseRecord.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching expense records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const body = await request.json()
    const { date, category, description, amount, status } = body

    if (!date || !category || !amount) {
      return NextResponse.json({ error: "Date, category, and amount are required" }, { status: 400 })
    }

    const newRecord = new ExpenseRecord({
      date: new Date(date),
      category,
      description: description || "",
      amount: parseFloat(amount),
      status: status || "Pending"
    })

    await newRecord.save()
    return NextResponse.json({ message: "Expense record created successfully", record: newRecord })
  } catch (error) {
    console.error("Error creating expense record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const body = await request.json()
    const { _id, date, category, description, amount, status } = body

    if (!_id || !date || !category || !amount) {
      return NextResponse.json({ error: "ID, date, category, and amount are required" }, { status: 400 })
    }

    const updatedRecord = await ExpenseRecord.findByIdAndUpdate(
      _id,
      {
        date: new Date(date),
        category,
        description: description || "",
        amount: parseFloat(amount),
        status: status || "Pending"
      },
      { new: true }
    )

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Expense record updated successfully", record: updatedRecord })
  } catch (error) {
    console.error("Error updating expense record:", error)
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    const deletedRecord = await ExpenseRecord.findByIdAndDelete(id)

    if (!deletedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Expense record deleted successfully" })
  } catch (error) {
    console.error("Error deleting expense record:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
} 