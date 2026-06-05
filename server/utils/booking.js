import Booking from '../models/Booking.js';

export function nightsBetween(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

export async function bookedUnitsForRoom(roomId, checkIn, checkOut) {
  return Booking.countDocuments({
    room: roomId,
    status: { $ne: 'cancelled' },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
}

export function calculateDiscount(offer, subtotal, nights) {
  if (!offer || !offer.active || nights < offer.minStayNights) return 0;

  const now = new Date();
  if (offer.validFrom && offer.validFrom > now) return 0;
  if (offer.validTo && offer.validTo < now) return 0;

  if (offer.discountType === 'fixed') {
    return Math.min(subtotal, offer.discountValue);
  }

  return Math.round(subtotal * (offer.discountValue / 100));
}
