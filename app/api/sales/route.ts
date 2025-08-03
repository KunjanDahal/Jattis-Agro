import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

const salesRecordSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true },
  date: { type: Date, required: true, default: Date.now },
  quantity: { type: Number, required: true, min: 0 },
  pricePerKg: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  customerName: { type: String, required: true, trim: true },
  status: { type: String, required: true, enum: ["Pending", "Completed", "Canceled"], default: "Pending" }
}, { timestamps: true })

const SalesRecord = mongoose.models.SalesRecord || mongoose.model("SalesRecord", salesRecordSchema)

export async function GET() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const records = await SalesRecord.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching sales records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const body = await request.json()
    const { orderId, date, quantity, pricePerKg, totalPrice, customerName, status } = body

    if (!orderId || !date || !quantity || !pricePerKg || !customerName) {
      return NextResponse.json({ error: "Order ID, date, quantity, price per kg, and customer name are required" }, { status: 400 })
    }

    // Check if order ID already exists
    const existingOrder = await SalesRecord.findOne({ orderId: parseInt(orderId) })
    if (existingOrder) {
      return NextResponse.json({ error: "Order ID already exists" }, { status: 400 })
    }

    const newRecord = new SalesRecord({
      orderId: parseInt(orderId),
      date: new Date(date),
      quantity: parseFloat(quantity),
      pricePerKg: parseFloat(pricePerKg),
      totalPrice: parseFloat(totalPrice),
      customerName,
      status: status || "Pending"
    })

    await newRecord.save()
    return NextResponse.json({ message: "Sales record created successfully", record: newRecord })
  } catch (error) {
    console.error("Error creating sales record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI)
    }

    const body = await request.json()
    const { _id, orderId, date, quantity, pricePerKg, totalPrice, customerName, status } = body

    if (!_id || !orderId || !date || !quantity || !pricePerKg || !customerName) {
      return NextResponse.json({ error: "ID, order ID, date, quantity, price per kg, and customer name are required" }, { status: 400 })
    }

    // Check if order ID already exists for a different record
    const existingOrder = await SalesRecord.findOne({ 
      orderId: parseInt(orderId), 
      _id: { $ne: _id } 
    })
    if (existingOrder) {
      return NextResponse.json({ error: "Order ID already exists" }, { status: 400 })
    }

    const updatedRecord = await SalesRecord.findByIdAndUpdate(
      _id,
      {
        orderId: parseInt(orderId),
        date: new Date(date),
        quantity: parseFloat(quantity),
        pricePerKg: parseFloat(pricePerKg),
        totalPrice: parseFloat(totalPrice),
        customerName,
        status: status || "Pending"
      },
      { new: true }
    )

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Sales record updated successfully", record: updatedRecord })
  } catch (error) {
    console.error("Error updating sales record:", error)
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

    const deletedRecord = await SalesRecord.findByIdAndDelete(id)

    if (!deletedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Sales record deleted successfully" })
  } catch (error) {
    console.error("Error deleting sales record:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
} 