import mongoose from "mongoose"

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

export default mongoose.models.DhaanRecord || mongoose.model("DhaanRecord", dhaanRecordSchema)
