import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    comment: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'removed'], default: 'pending' },
    adminResponse: String,
  },
  { timestamps: true },
);

export default mongoose.model('Review', reviewSchema);
