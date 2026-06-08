// utils/sendEmail.js


/**
 * Sends a booking confirmation email using Resend's email API.
 *
 * @param {Object} params
 * @param {Object} params.booking - Booking details.
 * @param {Object} params.room - Room details.
 * @param {Object} params.user - User details.
 * @param {string} [params.recipient] - Optional override email address.
 * @returns {Promise<Object>} Result indicating if the email was sent.
 */
export async function sendBookingEmail({ booking, room, user, recipient }) {
  const to = recipient || booking.guestDetails?.email || user.email;

  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured.');
    return { sent: false, reason: 'Resend not configured', to };
  }

  const formatDate = (value) =>
    new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const money = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211f;max-width:720px;margin:0 auto">
      <div style="background:#17211f;color:#fff;padding:24px;border-radius:10px 10px 0 0">
        <h1 style="margin:0;font-size:26px">Booked Successfully ✅</h1>
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
  `;

  try {
    const fromAddress = 'StayEase <onboarding@resend.dev>';
    const requestBody = {
      from: fromAddress,
      to,
      subject: `Booking Confirmed – ${room.name}`,
      html,
    };

    console.log(`[mailer] Sending email via Resend...`);
    console.log(`[mailer] Sender: ${fromAddress}`);
    console.log(`[mailer] Recipient: ${to}`);
    console.log(`[mailer] Auth Header starts with: Bearer ${process.env.RESEND_API_KEY.substring(0, 8)}...`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('[mailer] status:', response.status);
console.log('[mailer] result:', result);
    
    console.log(`[mailer] Resend HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`[mailer] Full Resend response:`, JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('[mailer] Resend email failed:', result);
      
      // Check if Resend rejected the onboarding sender
      let reason = result.error?.message || 'Resend error';
      if (response.status === 403 && reason.toLowerCase().includes('can only send testing emails to its own email address')) {
         reason = `Resend rejection: The onboarding sender (onboarding@resend.dev) is active on the free tier, which restricts sending emails strictly to the exact verified email address registered with your Resend account. To send emails to arbitrary guests, you must verify your own custom domain in the Resend dashboard.`;
      }
      console.log('[mailer] FAILED');
      return { sent: false, reason, to };
    }
    
    console.log(`[mailer] Email sent successfully to ${to}. ID: ${result.id}`);
    return { sent: true, to };
  } catch (error) {
    console.error('[mailer] Resend send exception:', error.message);
    return { sent: false, reason: error.message, to };
  }
}