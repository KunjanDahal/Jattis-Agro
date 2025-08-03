import { NextResponse } from "next/server"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI)
    return NextResponse.json({ 
      status: "success", 
      message: "MongoDB connected successfully!",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json({ 
      status: "error", 
      message: "Failed to connect to MongoDB",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
