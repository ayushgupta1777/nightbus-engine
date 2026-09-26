# NightBus Engine

Welcome to the NightBus Engine wiki.

This project is the core backend API for the NightBus booking ecosystem. It exposes the primary business logic, booking flow, admin operations, realtime updates, payment handling, notifications, and third-party integrations required to run the platform.

## Overview

- Project name: nightbus-engine
- Stack: Node.js, Express, MongoDB, Socket.IO, JWT, Firebase, Razorpay
- Runtime: CommonJS Node.js server
- Main entry: `server.js`

The app is organized around a modular API server that exposes routes under `/api/*` and supports:
- authentication and user management
- bus, route, trip, and journey operations
- booking and service booking management
- realtime updates via Socket.IO
- telemetry and tracking
- payment and wallet flows
- notifications and admin tools
- marketplace, coupons, reviews, and home-content APIs

## Architecture

The server bootstraps an Express application and wires together:

- middleware for security, CORS, rate limiting, and request parsing
- MongoDB connectivity through Mongoose
- Socket.IO for realtime events
- route modules in the `routes/` folder
- controller logic in `controllers/`
- business logic in `services/`
- validation and model/schema definitions in `models/`
- static assets in `public/` and uploaded media in `uploads/`

Main app bootstrap:

- `server.js` initializes Express
- defines API route mounts
- sets up Socket.IO
- configures graceful shutdown and error handling
- starts background jobs such as auto-cancel and auto-complete tasks

## Key API Areas

### Authentication and Users
- `/api/auth`
- `/api/users`
- `/api/admin`

### Fleet and Operations
- `/api/buses`
- `/api/routes`
- `/api/trips`
- `/api/journeys`
- `/api/locations`
- `/api/realtime`

### Booking and Service Flow
- `/api/bookings`
- `/api/segments`
- `/api/boarding`
- `/api/services`
- `/api/service-bookings`

### Payments and Wallet
- `/api/payment`
- `/api/wallet`
- `/api/orders`

### Admin and Platform Features
- `/api/vendors`
- `/api/staff`
- `/api/notifications`
- `/api/coupons`
- `/api/reviews`
- `/api/home-content`
- `/api/developer`

### Tracking and Telemetry
- `/api/owner`
- `/api/tracking`
- `/api/telemetry`

## Environment and Configuration

The app uses environment variables through `dotenv`.

Typical runtime configuration includes:
- `PORT`
- `MONGODB_URI`
- JWT secret values
- external provider credentials
- notification and payment configuration
- Firebase configuration

The project is designed to run with a MongoDB instance, and the app checks for a valid database connection before serving business operations in normal runtime scenarios.

## Local Development

### Install dependencies
```bash
npm install
```

### Run in development mode
```bash
npm run dev
```

### Start production server
```bash
npm start
```

### Run tests
```bash
npm test
```

## Health and Diagnostics

The project exposes a health check endpoint:

```http
GET /health
```

This returns a JSON success status and a timestamp.

There is also a test-only route:

```http
GET /test-auth
```

This route is disabled in production.

## Security and Reliability

The app includes:
- `helmet` for HTTP header hardening
- `cors` for cross-origin handling
- rate limiting for API routes
- Mongo sanitization for NoSQL injection prevention
- structured error handling
- unhandled rejection and uncaught exception hooks
- socket and background-job initialization

## Common Maintenance Tasks

### Start server
```bash
npm run dev
```

### Verify API endpoints
Use the project’s route set and test scripts, or invoke the health route to confirm the app is up.

### Check logs
Server logs show connection, route, and error diagnostics. Error logs are emitted to the console and system logs when available.

## Project Structure

```text
nightbus-engine/
├── admin_routes/
├── config/
├── controllers/
├── middleware/
├── models/
├── public/
├── routes/
├── scripts/
├── seeds/
├── services/
├── tests/
├── uploads/
├── utils/
├── .gitignore
├── .gitattributes
├── checkRoutes.js
├── checkRoutes2.js
├── jest.config.js
├── package.json
├── server.js
├── test.js
├── test_api.js
├── test_notifications.js
└── ...
```

## Notes

This repository is the backend engine for the NightBus platform and acts as the main operational API layer for the product ecosystem. It contains route definitions and business workflows for transit, booking management, payments, notifications, and admin operations.

---

If you want, I can also generate:
- a `Home` page
- a `Setup Guide` page
- an `API Reference` page
- a `Deployment Guide` page
- a `Troubleshooting` page
- a `Sidebar` structure for the wiki
```

If you want, I can also turn this into a multi-page wiki structure with separate pages like:
- Home
- Setup & Run
- API Overview
- Deployment
- Troubleshooting
- Admin Features
