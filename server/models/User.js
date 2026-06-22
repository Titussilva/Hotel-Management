import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ['guest', 'admin'], default: 'guest' },
    preferences: {
      bedType: String,
      amenities: [String],
      budget: Number,
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
