# 🌴 NextKey

NextKey is a premium, full-stack hotel and villa booking platform designed to connect discerning travelers with luxury accommodations. It provides a seamless experience for guests to discover and book stays, while offering robust management tools for property vendors and platform administrators.

---

## ✨ Overview

Whether you are looking to book a weekend getaway or manage a portfolio of boutique hotels, NextKey provides the tools to make it happen.

### 🎯 Key Features

- **For Travelers (Users):**
  - **Smart Search:** Browse hotels, resorts, and villas across various cities and states.
  - **Flexible Payments (Pay at Hotel):** Secure your reservation online and handle the payment directly at the property upon arrival.
  - **Secure Booking:** A highly reliable booking system that temporarily locks rooms during checkout to prevent double-booking.
  - **Coupons & Discounts:** Apply promo codes for instant savings.
  - **Reviews & Ratings:** Share experiences and rate room quality, cleanliness, and service.
- **For Property Owners (Vendors/Hotels):**
  - **Inventory Management:** Add and update rooms, pricing, floor plans, and amenities.
  - **Booking Dashboard:** Track incoming reservations and manage room availability.
- **For Platform Owners (Super Admins):**
  - **Vendor Approvals:** Review and approve/reject new vendor applications.
  - **Total Oversight:** Manage users, monitor all transactions, and control platform fees.

---

## 💻 Technical Architecture

NextKey is built as a modern Single Page Application (SPA) using a robust MERN-like stack, designed for high performance, scalability, and secure concurrent transactions.

### 🛠 Tech Stack

- **Frontend:** React.js, React Router DOM, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose ODM for strict schema validation)
- **Authentication:** Firebase Auth (Google OAuth) + Custom JWT/OTP implementation
- **Hosting/Deployment:** Vercel (Frontend) | Render (Backend)

### 🗄 Database Highlights

The database is highly relational (simulated via Mongoose ObjectIds) to ensure data integrity:

- **Role-Based Access Control (RBAC):** Users are strictly partitioned into `user`, `vendor`, `hotel`, and `super_admin` roles.
- **Temporary Booking Locks:** Uses MongoDB TTL (Time-To-Live) indexes in a `TempBooking` collection to hold a room for 5 minutes during checkout, preventing race conditions.
- **Hierarchical Location Data:** States ➔ Districts ➔ Cities for precise filtering.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Firebase Account](https://firebase.google.com/) (For Auth setup)
