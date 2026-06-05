# StayEase Hotel Booking System

A MERN stack hotel booking system with a React + TailwindCSS interface, Express API, MongoDB models, booking availability checks, reviews, offers, admin operations, analytics, Indian rupee pricing, payment method selection, and Gmail booking request notifications.

## Features

- Search and filter rooms by date, room type, guests, price, location text, and amenities.
- Check room availability using overlapping booking dates and room inventory.
- View room descriptions with images, amenities, room size, bed type, view, guest capacity, and pricing.
- Create bookings with guest details, special requests, offer codes, and payment method selection for card, wallet, UPI, net banking, email confirmation, or pay-at-hotel follow-up.
- Require guests to log in or register before they can access the hotel website.
- Manage booking history and cancellations for authenticated users.
- Submit room reviews after a valid booking.
- Admin APIs for room management, booking management, review moderation, offer management, and analytics.
- User profile editing, favorite rooms, live booking history, review submission, in-app notifications, and admin management screens.
- Payment integration is configured as a safe booking handoff: no online charge is collected, selected payment details are saved as pending, and booking details are emailed through Gmail for secure follow-up.

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Start MongoDB locally or set `MONGODB_URI` to a hosted MongoDB database.
3. Install packages:

```bash
npm install --cache ./.npm-cache
```

4. Seed demo data:

```bash
npm run seed
```

5. Run the app:

```bash
npm run dev
```

Client: `http://127.0.0.1:5173`

API: `http://127.0.0.1:5000/api`

## Demo Accounts

- Guest: `guest@stayease.test` / `password123`
- Admin: `admin@stayease.test` / `password123`

The frontend also supports the guest demo login if the API or MongoDB is not running, so the room catalog can still be viewed during local UI testing.

## Payment Integration and Gmail Booking Emails

Set these environment values so booking details are sent to Gmail:

```bash
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
BOOKING_EMAIL_TO=hotel-admin-copy@gmail.com
```

Use a Gmail app password for `GMAIL_APP_PASSWORD`, and start the server from the project root so the `.env` file is loaded correctly.

If Gmail is not configured, the app still saves the booking and prints the email content in the server logs for local testing.

The booking form supports credit/debit card, digital wallet, UPI, net banking, pay-after-email-confirmation, and pay-at-hotel options. To match the requested no-real-payment behavior, these methods do not charge the user; the chosen method is stored on the booking and sent by email with the reservation details. Each guest receives mail at their own account email. `BOOKING_EMAIL_TO` is only an optional hotel/admin copy address.

## Verification

```bash
npm run build
node --check server/index.js
node --check server/routes/bookings.js
node --check server/routes/admin.js
```
