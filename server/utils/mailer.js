import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,

  secure: false,

  requireTLS: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

transporter.verify((err) => {
  if (err) {
    console.error('[SMTP ERROR]', err);
  } else {
    console.log('[SMTP READY]');
  }
});

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

    console.log('[MAIL] recipient:', to);

    if (!to) {
      return {
        sent: false,
        reason: 'Recipient email missing',
      };
    }

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>Booking Confirmed ✅</h2>

        <p>Hello ${user?.name || 'Guest'},</p>

        <p>Your booking has been confirmed.</p>

        <hr>

        <p><strong>Room:</strong> ${room?.name}</p>

        <p><strong>Check In:</strong>
        ${new Date(booking.checkIn).toLocaleDateString()}</p>

        <p><strong>Check Out:</strong>
        ${new Date(booking.checkOut).toLocaleDateString()}</p>

        <p><strong>Total:</strong>
        ₹${booking.total}</p>

        <p><strong>Payment Status:</strong>
        ${booking.paymentStatus}</p>

        <br>

        <p>Thank you for choosing StayEase.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER,
      to,
      subject: `Booking Confirmed – ${room.name}`,
      html,
    });

    console.log('[MAIL SUCCESS]', info.messageId);

    return {
      sent: true,
      messageId: info.messageId,
    };

  } catch (err) {
    console.error('[MAIL ERROR]', err);

    return {
      sent: false,
      reason: err.message,
    };
  }
}