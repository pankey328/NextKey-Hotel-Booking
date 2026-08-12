# NextKey Hotel Booking Platform

NextKey is a comprehensive full-stack hotel and villa booking platform built with the MERN stack. It provides a seamless experience for guests to discover and book properties while offering robust dashboard tools for vendors and super admins to manage operations at scale.

## Tech Stack

- **Frontend:** React.js, TailwindCSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, OTP, Firebase (Google OAuth)
- **Other Tools:** node-cron, Papaparse (for CSV handling)

## Key Features

### For Guests
- **Property Discovery:** Advanced server-side search, filtering, dynamic sorting, and pagination.
- **Robust Booking Engine:** 
  - **Concurrency-Safe:** Prevents double-booking using a 5-minute `TempBooking` lock system (backed by MongoDB TTL indexes) while the user completes checkout.
  - **Comprehensive Guest Details:** Captures primary guest information, adult/child counts, and special requests during checkout.
- **Reviews & Ratings:** Guests can leave feedback on past stays.

### For Vendors & Hotel Staff
- **Role-Based Access Control (RBAC):** Strict data isolation and authorization ensuring vendors only see and manage their own properties.
- **Bulk Data Management:** A robust 4-step bulk import pipeline supporting direct CSV uploads or Google Sheets links. Includes a frontend dry-run validation preview to catch duplicate/invalid data before saving.
- **Reservation Dashboard:** Real-time visibility into arriving guests, including their contact information and special requests.

### Core Backend Architecture
- **MongoDB Transactions:** Ensures data integrity by using atomic, multi-document transactions for critical actions (e.g., booking creation, atomic creation of hotels + rooms, and Super Admin approvals).
- **Automated Cron Jobs:** A nightly `node-cron` job automatically queries the database for expired/no-show reservations, updates their status, and triggers auto-cancellation emails.
- **Performance Optimized:** Heavy lifting (aggregation, sorting, filtering) is handled entirely server-side to keep the frontend client fast and lightweight.

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Firebase Project (for Google Auth)


