import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Define the schema
const chuiraRecordSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  produced: {
    type: Number,
    required: true,
    min: 0
  },
  bhuss: {
    type: Number,
    required: true,
    min: 0
  },
  operatorName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ["In Progress", "Completed", "Failed"],
    default: "In Progress"
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
})

// Get or create the model
const ChuiraRecord = mongoose.models.ChuiraRecord || mongoose.model("ChuiraRecord", chuiraRecordSchema)

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI)
    const records = await ChuiraRecord.find({}).sort({ createdAt: -1 })
    
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
    const { batchId, produced, bhuss, operatorName, status, date } = body

    // Validate required fields
    if (!batchId || !produced || !bhuss || !operatorName || !status || !date) {
      return NextResponse.json({ 
        error: "All fields are required" 
      }, { status: 400 })
    }

    // Create new record
    const newRecord = new ChuiraRecord({
      batchId,
      produced: parseFloat(produced),
      bhuss: parseFloat(bhuss),
      operatorName,
      status,
      date: new Date(date)
    })

    const savedRecord = await newRecord.save()
    
    return NextResponse.json({ 
      message: "Chuira batch added successfully", 
      record: savedRecord 
    }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to add batch" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI)
    const body = await request.json()
    const { _id, batchId, produced, bhuss, operatorName, status, date } = body

    // Validate required fields
    if (!_id || !batchId || !produced || !bhuss || !operatorName || !status || !date) {
      return NextResponse.json({ 
        error: "All fields are required" 
      }, { status: 400 })
    }

    // Update record
    const updatedRecord = await ChuiraRecord.findByIdAndUpdate(
      _id,
      {
        batchId,
        produced: parseFloat(produced),
        bhuss: parseFloat(bhuss),
        operatorName,
        status,
        date: new Date(date)
      },
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return NextResponse.json({ 
        error: "Record not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Chuira batch updated successfully", 
      record: updatedRecord 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to update batch" 
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
    const deletedRecord = await ChuiraRecord.findByIdAndDelete(id)

    if (!deletedRecord) {
      return NextResponse.json({ 
        error: "Record not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Chuira batch deleted successfully", 
      record: deletedRecord 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to delete batch" 
    }, { status: 500 })
  }
} 