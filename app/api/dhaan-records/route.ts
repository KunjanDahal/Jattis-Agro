import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Define the schema
const dhaanRecordSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  farmer: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
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
const DhaanRecord = mongoose.models.DhaanRecord || mongoose.model("DhaanRecord", dhaanRecordSchema)

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI)
    const records = await DhaanRecord.find({}).sort({ createdAt: -1 })
    
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
    
    // Validate required fields
    if (!body.quantity || !body.farmer || !body.location) {
      return NextResponse.json({ 
        error: "Quantity, farmer, and location are required" 
      }, { status: 400 })
    }

    // Create new record
    const newRecord = new DhaanRecord({
      quantity: parseFloat(body.quantity),
      farmer: body.farmer,
      location: body.location,
      date: body.date || new Date()
    })

    const savedRecord = await newRecord.save()
    
    return NextResponse.json({ 
      message: "Record created successfully", 
      record: savedRecord 
    }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to create record" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI)
    const body = await request.json()
    
    // Validate required fields
    if (!body._id || !body.quantity || !body.farmer || !body.location) {
      return NextResponse.json({ 
        error: "ID, quantity, farmer, and location are required" 
      }, { status: 400 })
    }

    // Update record
    const updatedRecord = await DhaanRecord.findByIdAndUpdate(
      body._id,
      {
        quantity: parseFloat(body.quantity),
        farmer: body.farmer,
        location: body.location,
        date: body.date || new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return NextResponse.json({ 
        error: "Record not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Record updated successfully", 
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
    const deletedRecord = await DhaanRecord.findByIdAndDelete(id)

    if (!deletedRecord) {
      return NextResponse.json({ 
        error: "Record not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Record deleted successfully", 
      record: deletedRecord 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: "Failed to delete record" 
    }, { status: 500 })
  }
}
