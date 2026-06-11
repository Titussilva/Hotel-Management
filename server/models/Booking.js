import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    guestDetails: {
      name: String,
      email: String,
      phone: String,
    },
    specialRequests: String,
    offerCode: String,
    subtotal: Number,
    discount: { type: Number, default: 0 },
    total: Number,
    paymentMethod: String,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: true },
);

export default mongoose.model('Booking', bookingSchema);