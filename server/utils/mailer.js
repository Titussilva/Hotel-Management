import nodemailer from 'nodemailer';

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || pass.includes('replace_me')) {
    console.warn('Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    authMethod: 'LOGIN',
  });
}

export async function sendBookingEmail({ booking, room, user, recipient }) {
  const transporter = getTransporter();
  const to = recipient || booking.guestDetails?.email || user.email;
  const cc = process.env.BOOKING_EMAIL_TO && process.env.BOOKING_EMAIL_TO !== to ? process.env.BOOKING_EMAIL_TO : undefined;

  const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const money = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
  const paymentLabels = {
    card: 'Credit/debit card',
    digital_wallet: 'Digital wallet',
    upi: 'UPI',
    netbanking: 'Net banking',
    pay_at_hotel: 'Pay at hotel',
    pay_by_email: 'Pay after email confirmation',
  };
  const paymentMethod = paymentLabels[booking.paymentMethod] || booking.paymentMethod || 'Not selected';

  const receiptSections = [
    {
      title: 'Booking Details',
      rows: [
        ['Booking ID', booking._id],
        ['Status', 'Booked successfully'],
        ['Check-in', formatDate(booking.checkIn)],
        ['Check-out', formatDate(booking.checkOut)],
        ['Guests', booking.guests],
        ['Special requests', booking.specialRequests || 'None'],
      ],
    },
    {
      title: 'Room Details',
      rows: [
        ['Room', room.name],
        ['Room type', room.type],
        ['Room size', room.size || 'Not specified'],
        ['Bed type', room.bedType || 'Not specified'],
        ['View', room.view || 'Not specified'],
        ['Amenities', room.amenities?.join(', ') || 'Not specified'],
      ],
    },
    {
      title: 'Guest and Payment',
      rows: [
        ['Guest', booking.guestDetails?.name || user.name],
        ['Email', booking.guestDetails?.email || user.email],
        ['Phone', booking.guestDetails?.phone || 'Not provided'],
        ['Payment method', paymentMethod],
        ['Payment status', booking.paymentStatus],
      ],
    },
    {
      title: 'Price Summary',
      rows: [
        ['Subtotal', money(booking.subtotal)],
        ['Discount', money(booking.discount)],
        ['Total', money(booking.total)],
      ],
    },
  ];

  const lines = [
    'Booked successfully',
    '',
    ...receiptSections.flatMap((section) => [
      section.title,
      ...section.rows.map(([label, value]) => `${label}: ${value}`),
      '',
    ]),
  ];

  const renderRows = (rows) => rows
    .map(([label, value]) => `<tr><td style="font-weight:700;border:1px solid #ddd;padding:8px;background:#f8faf8">${label}</td><td style="border:1px solid #ddd;padding:8px">${value}</td></tr>`)
    .join('');

  if (!transporter) {
    console.log('Gmail not configured. Booking email content:');
    console.log(lines.join('\n'));
    return { sent: false, reason: 'Gmail is not configured', to, cc };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.BOOKING_EMAIL_FROM_NAME || 'StayEase Hotel Booking'}" <${process.env.GMAIL_USER}>`,
      to,
      cc,
      subject: `Booking receipt - ${room.name}`,
      text: lines.join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211f;max-width:720px;margin:0 auto">
          <div style="background:#17211f;color:#fff;padding:24px;border-radius:10px 10px 0 0">
            <h1 style="margin:0;font-size:26px">Booked successfully</h1>
            <p style="margin:8px 0 0;color:#dfe9e4">Thank you for booking with StayEase. Your booking receipt is below.</p>
          </div>
          <div style="border:1px solid #ddd;border-top:0;padding:20px;border-radius:0 0 10px 10px">
            ${receiptSections.map((section) => `
              <h2 style="font-size:18px;margin:18px 0 8px">${section.title}</h2>
              <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:12px">
                ${renderRows(section.rows)}
              </table>
            `).join('')}
            <p style="margin-top:18px;color:#4b5563">Please keep this receipt for your records.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Gmail send failed:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return {
      sent: false,
      to,
      cc,
      reason: error.message || 'Unknown email error',
      errorCode: error.code,
      errorResponse: error.response,
    };
  }

  return { sent: true, to, cc };
}
