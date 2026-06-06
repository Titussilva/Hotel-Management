import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    validFrom: Date,
    validTo: Date,
    minStayNights: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Offer', offerSchema);
