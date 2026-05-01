# MakeMyTrip — Accommodation Booking Platform

A full-stack accommodation booking web application built with Node.js and Express, inspired by Airbnb. Users can list properties, browse accommodations, leave reviews, and book stays with integrated payment processing.

---

## Features

- **User Authentication** — Register, login, and logout with session persistence
- **Listings Management** — Create, view, edit, and delete property listings with image uploads
- **Reviews & Ratings** — 1–5 star ratings with comments on any listing
- **Booking System** — Date-range availability checks, room selection, and guest management
- **Payment Integration** — End-to-end payment flow via Razorpay with HMAC signature verification
- **Geolocation** — Automatic geocoding via OpenStreetMap and map display via Google Maps
- **Booking History** — Per-user history of all completed bookings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Authentication | Passport.js (Local strategy) |
| Templating | EJS + ejs-mate |
| Image Storage | Cloudinary + Multer |
| Payments | Razorpay |
| Geocoding | OpenStreetMap Nominatim API |
| Maps Display | Google Maps API |
| Validation | Joi |
| Sessions | express-session + connect-mongo |

---

## Project Structure

```
AirBnb/
├── app.js                  # Express app setup, middleware, route mounting
├── cloudConfig.js          # Cloudinary & Multer configuration
├── razorpayConfig.js       # Razorpay client initialization
├── middleware.js           # Auth guards, ownership checks, Joi validators
├── schema.js               # Joi validation schemas (listing, review, booking)
│
├── models/
│   ├── user.js             # User schema (passport-local-mongoose)
│   ├── listing.js          # Property schema with GeoJSON geometry
│   ├── review.js           # Review schema with author reference
│   └── booking.js          # Booking schema with date range & room count
│
├── routes/
│   ├── user.js             # /signup, /login, /logout, /bookings
│   ├── listing.js          # /listings CRUD
│   ├── review.js           # /listings/:id/reviews
│   └── booking.js          # /booking/:id — availability, payment, verify
│
├── controllers/
│   ├── users.js
│   ├── listings.js
│   └── reviews.js
│
├── views/
│   ├── layouts/boilerplate.ejs
│   ├── includes/           # navbar, flash, footer
│   ├── listings/           # index, show, new, edit, error
│   ├── users/              # signup, login
│   └── bookings/           # booking, bill, success, failure, history
│
├── utils/
│   ├── ExpressError.js     # Custom error class
│   └── wrapAsync.js        # Async route error wrapper
│
├── public/                 # Static CSS, JS, images
└── init/                   # DB seed script and sample data
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (test mode works)
- Google Maps API key

### Installation

```bash
git clone <repo-url>
cd AirBnb
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_CONNECTION=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SESSION_SECRET=your_session_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Seed the Database (optional)

```bash
node init/index.js
```

This clears existing listings, geocodes the seed data, and populates the database with sample accommodations.

### Start the Server

```bash
node app.js
```

The app runs at `http://localhost:8080`.

---

## Routes Overview

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/signup` | Registration form |
| POST | `/signup` | Create new account |
| GET | `/login` | Login form |
| POST | `/login` | Authenticate user |
| GET | `/logout` | End session |
| GET | `/bookings` | Booking history (auth required) |

### Listings
| Method | Route | Description |
|---|---|---|
| GET | `/listings` | All listings |
| GET | `/listings/new` | New listing form (auth required) |
| POST | `/listings` | Create listing (auth required) |
| GET | `/listings/:id` | Listing detail with reviews and map |
| GET | `/listings/:id/edit` | Edit form (owner only) |
| PUT | `/listings/:id` | Update listing (owner only) |
| DELETE | `/listings/:id` | Delete listing (owner only) |

### Reviews
| Method | Route | Description |
|---|---|---|
| POST | `/listings/:id/reviews` | Create review (auth required) |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete review (author only) |

### Bookings & Payments
| Method | Route | Description |
|---|---|---|
| GET | `/booking/:id` | Booking form |
| POST | `/booking/:id/pay` | Validate availability, store booking in session |
| GET | `/booking/:id/pay` | Bill summary with GST breakdown |
| POST | `/booking/:id/create-order` | Create Razorpay order |
| POST | `/booking/:id/verify` | Verify payment signature, save booking |
| GET | `/booking/:id/success` | Payment success page |
| GET | `/booking/:id/failure` | Payment failure page |

---

## Key Implementation Details

### Booking & Availability
- Checks for overlapping bookings before accepting a reservation
- Prevents booking more rooms than available (`totalRooms` on listing)
- Price formula: `nights × rooms × pricePerNight × 1.18` (includes 18% GST)
- Booking data is stored in the session between the bill page and payment confirmation

### Payment Security
- Razorpay order created server-side with amount in paise
- Payment signature verified using HMAC-SHA256 (`razorpay_order_id + "|" + razorpay_payment_id`)
- Booking record only written to the database after successful signature verification

### Geolocation
- On listing creation/update, the location string is sent to the OpenStreetMap Nominatim API
- Coordinates are stored as a GeoJSON Point with a `2dsphere` index
- Google Maps renders the pin on the listing detail page

### Image Uploads
- Multer handles `multipart/form-data` with Cloudinary as the storage backend
- Images are stored under the `MakeMyTrip_DEV` folder in Cloudinary
- Accepted formats: PNG, JPG, JPEG

### Authentication & Authorization
- Passport.js Local strategy with `passport-local-mongoose` handling password hashing
- Sessions stored in MongoDB via `connect-mongo` with a 7-day TTL
- `isLoggedIn` middleware guards protected routes and saves the original URL for redirect after login
- `isOwner` and `isReviewAuthor` middleware enforce resource-level authorization

---

## Validation

Server-side validation is handled by Joi schemas in `schema.js`:

- **Listing** — title, description, location, country, price (≥ 0), totalRooms (≥ 1) are all required
- **Review** — comment required, rating must be 1–5
- **Booking** — rooms (≥ 1), guests (≥ 1), startDate, and endDate are all required

---

## Error Handling

- All async route handlers are wrapped with `wrapAsync()` to forward errors to Express
- A global error handler catches all errors and renders `views/listings/error.ejs`
- Unmatched routes return a 404 `ExpressError`
- Flash messages (via `connect-flash`) give users contextual feedback on form submissions and auth events

---

## Security Highlights

- Passwords hashed by `passport-local-mongoose` (scrypt)
- Sessions use `httpOnly` cookies with a secret-based signing key
- Payment integrity guaranteed by HMAC-SHA256 signature verification
- Input sanitized and validated server-side via Joi before any DB write
- Owner/author checks prevent unauthorized modifications to listings and reviews

---

## License

This project is for educational purposes.
