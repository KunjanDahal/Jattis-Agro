import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Define the schema
const salaryRecordSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  salaryAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
})

// Get or create the model
const SalaryRecord = mongoose.models.SalaryRecord || mongoose.model("SalaryRecord", salaryRecordSchema)

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI)
    const records = await SalaryRecord.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      message: "Records fetched successfully", 
      records: records 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch records" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI)
    const body = await request.json()
    const { employeeName, salaryAmount, paidDate } = body

    // Validate required fields
    if (!employeeName || !salaryAmount || !paidDate) {
      return NextResponse.json({ 
        error: "All fields are required" 
      }, { status: 400 })
    }

    // Create new record
    const newRecord = new SalaryRecord({
      employeeName,
      salaryAmount: parseFloat(salaryAmount),
      paidDate: new Date(paidDate)
    })

    const savedRecord = await newRecord.save()
    
    return NextResponse.json({ 
      message: "Salary record added successfully", 
      record: savedRecord 
    }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to add record" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI)
    const body = await request.json()
    const { _id, employeeName, salaryAmount, paidDate } = body

    // Validate required fields
    if (!_id || !employeeName || !salaryAmount || !paidDate) {
      return NextResponse.json({ 
        error: "All fields are required" 
      }, { status: 400 })
    }

    // Update record
    const updatedRecord = await SalaryRecord.findByIdAndUpdate(
      _id,
      {
        employeeName,
        salaryAmount: parseFloat(salaryAmount),
        paidDate: new Date(paidDate)
      },
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return NextResponse.json({ 
        error: "Record not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Salary record updated successfully", 
      record: updatedRecord 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to update record" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ 
        error: "Record ID is required" 
      }, { status: 400 })
    }

    // Delete record
    const deletedRecord = await SalaryRecord.findByIdAndDelete(id)

    if (!deletedRecord) {
      return NextResponse.json({ 
        error: "Record not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Salary record deleted successfully", 
      record: deletedRecord 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to delete record" 
    }, { status: 500 })
  }
} 