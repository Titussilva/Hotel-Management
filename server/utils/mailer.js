import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmail({ booking, room, user, recipient }) {
  const to = recipient || booking.guestDetails?.email || user.email;

  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured.');
    return { sent: false, reason: 'Resend not configured', to };
  }

  const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const money = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(value || 0);

  try {
    await resend.emails.send({
      from: 'StayEase <onboarding@resend.dev>',
      to,
      subject: `Booking receipt - ${room.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211f;max-width:720px;margin:0 auto">
          <div style="background:#17211f;color:#fff;padding:24px;border-radius:10px 10px 0 0">
            <h1 style="margin:0;font-size:26px">Booked successfully</h1>
            <p style="margin:8px 0 0;color:#dfe9e4">Thank you for booking with StayEase.</p>
          </div>
          <div style="border:1px solid #ddd;border-top:0;padding:20px;border-radius:0 0 10px 10px">
            <h2>Booking Details</h2>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Room:</strong> ${room.name}</p>
            <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)}</p>
            <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Total:</strong> ${money(booking.total)}</p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
          </div>
        </div>
      `,
    });
    return { sent: true, to };
  } catch (error) {
    console.error('Resend email failed:', error.message);
    return { sent: false, reason: error.message, to };
  }
}