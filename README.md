# Jay Ambe Travels — Smart Bus Reservation System

A complete, responsive bus reservation web app built with **React + Vite + TypeScript + Tailwind**. Users can search routes across 50+ Indian cities, pick seats from sleeper or seater layouts, fill in passenger details, and receive a downloadable e-ticket with a PNR and QR code.

> Author: **joybarotjb1** • Demo project for portfolio

---

## Live Features

- **Authentication** — Register and log in with form validation (email + 10‑digit phone + 6+ char password). Demo seed account auto-created.
  - Email: `demo@jayambetravels.in`
  - Password: `demo123`
- **Search** — Pick origin, destination (50+ Indian cities) and journey date.
- **Bus Listing** — Filter by bus type (AC Sleeper, Non-AC Sleeper, AC Seater, Volvo, etc.), departure window (morning / afternoon / evening / night) and price range. Skeleton loading state.
- **Seat Selection** — Realistic sleeper layout (lower + upper deck) or seater layout. Booked / available / selected states. Live fare summary with 5% GST.
- **Passenger Details** — Capture name, age and gender per seat plus contact email and phone, all validated with `react-hook-form` + `zod`.
- **Booking Confirmation** — Generates a unique PNR (`JAT-XXXXXX`), animated confetti burst, premium boarding-pass card with QR code, dashed perforation, and a full fare breakdown.
- **Ticket Download** — One-click download of a beautifully styled standalone HTML ticket with a built-in **Print → Save as PDF** button.
- **Simulated Email** — "Email Ticket" button simulates sending the ticket to the contact email with a toast notification.
- **My Bookings** — Logged-in users see all their past and upcoming reservations and can re-download any ticket.
- **Persistence** — All data is stored locally in `localStorage` (no backend required).
- **Theming** — Premium deep-blue + saffron palette with light & dark mode support.
- **Responsive** — Works on mobile, tablet and desktop.

---

## Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Routing:** Wouter
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion + canvas-confetti
- **Forms:** react-hook-form + zod
- **Icons:** lucide-react
- **QR Code:** qrcode.react
- **Notifications:** sonner

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run the dev server
pnpm --filter @workspace/jay-ambe-travels run dev

# Type-check the project
pnpm --filter @workspace/jay-ambe-travels run typecheck

# Build for production
pnpm --filter @workspace/jay-ambe-travels run build
```

The app runs on the port assigned by the `PORT` environment variable.

---

## App Flow

1. **Home** — Search form with origin, destination and date.
2. **Buses** — List of available buses with filters and amenities.
3. **Seats** — Sleeper or seater seat-map; pick one or more seats.
4. **Passenger Details** — One form card per seat plus contact info.
5. **Confirmation** — Confetti, boarding pass with QR, download / email actions.
6. **My Bookings** — History of all reservations for the logged-in user.

Routes `/seats/:busId`, `/passenger/:busId`, `/confirmation/:pnr` and `/my-bookings` are protected and require login.

---

## Project Structure

```
src/
├── components/        # Navbar + shadcn/ui primitives
├── hooks/             # useAuth (AuthProvider)
├── lib/
│   ├── data.ts        # CITIES list + generateBuses + getBookedSeats
│   ├── storage.ts     # User / Booking types + localStorage helpers
│   └── ticket.ts      # downloadTicketHTML (styled e-ticket generator)
├── pages/
│   ├── home.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── buses.tsx
│   ├── seats.tsx
│   ├── passenger.tsx
│   ├── confirmation.tsx
│   ├── my-bookings.tsx
│   └── not-found.tsx
├── App.tsx            # Router + ProtectedRoute
└── main.tsx
```

---

## Notes

- This is a **simulated** booking system — no real payments or emails are processed.
- All bookings live in the browser's `localStorage` and are scoped to the logged-in user.
- PNR format: `JAT-XXXXXX` (6 hex characters).

---

## License

MIT — free to use for learning and portfolio demos.
