import axios from 'axios';

export async function sendBookingEmail({
  booking,
  room,
  user,
  recipient,
}) {
  try {
    const to =
      recipient ||
      booking?.guestDetails?.email ||
      user?.email;

    if (!to) {
      return {
        sent: false,
        reason: 'Recipient email missing',
      };
    }

    const html = `
      <h2>Booking Confirmed ✅</h2>

      <p>Hello ${user?.name || 'Guest'},</p>

      <p>Your booking is confirmed.</p>

      <p><b>Room:</b> ${room.name}</p>
      <p><b>Check In:</b> ${booking.checkIn}</p>
      <p><b>Check Out:</b> ${booking.checkOut}</p>
      <p><b>Total:</b> ₹${booking.total}</p>

      <br/>

      <p>Thank you for choosing StayEase.</p>
    `;

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'StayEase',
          email: process.env.EMAIL_FROM,
        },

        to: [
          {
            email: to,
          },
        ],

        subject: `Booking Confirmed – ${room.name}`,

        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[MAIL SUCCESS]', response.data);

    return {
      sent: true,
    };

  } catch (err) {
    console.error(
      '[MAIL ERROR]',
      err.response?.data || err.message
    );

    return {
      sent: false,
      reason:
        err.response?.data?.message ||
        err.message,
    };
  }
}