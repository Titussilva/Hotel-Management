import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
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
transporter.verify((error, success) => {
  if (error) {
    console.log('[SMTP ERROR]', error);
  } else {
    console.log('[SMTP READY]');
  }
});