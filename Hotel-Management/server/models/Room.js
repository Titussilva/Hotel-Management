import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
    price: { type: Number, required: true },
    size: String,
    bedType: String,
    view: String,
    maxGuests: { type: Number, default: 2 },
    amenities: [String],
    totalUnits: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Room', roomSchema);
