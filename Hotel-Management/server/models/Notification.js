import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['booking', 'payment', 'reminder', 'offer'], default: 'booking' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ['in_app', 'email', 'sms'], default: 'in_app' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Notification', notificationSchema);
