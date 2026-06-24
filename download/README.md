# LogistiKAI — Smart Logistics Platform for India

A scalable, production-ready logistics platform optimized for India's delivery ecosystem with real-time GPS tracking, route efficiency, and multi-city fleet management.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite via Prisma ORM |
| Real-time | Socket.IO (mini-service on port 3004) |
| State | Zustand (client) + TanStack Query (server) |
| Charts | Recharts |
| Auth | Role-based demo (Admin / Manager / Driver) |

---

## Features

### User Roles
- **Admin** — Full operations dashboard, analytics, multi-city management, settings
- **Manager** — Fleet overview, delivery tracking, performance analytics
- **Driver** — Mobile-first view with active delivery, route info, ETA, and delivery actions

### Real-Time GPS Tracking
- Socket.IO-powered live vehicle positions across 8 Indian cities
- Speed-based color coding (stopped / slow-traffic / normal / fast)
- City-level filtering with zoom controls
- Simulated traffic-aware routing (peak hours: 8–11 AM & 5–8 PM IST)
- ETA prediction and delivery progress tracking

### Delivery Management
- 48 seeded deliveries with realistic Indian data
- Search by tracking number, recipient, address, or city
- Filter by status (Pending / Assigned / In Transit / Delivered / Failed)
- Filter by city and priority (Low / Medium / High / Urgent)
- Detail panel with quick status-change actions
- Pagination with full data table

### Fleet Management
- 38 vehicles across 12 cities (trucks, vans, bikes, tempos)
- Driver assignment tracking
- Capacity, fuel type, and fuel efficiency metrics
- Vehicle status overview (Available / In Transit / Maintenance)

### Analytics & Insights
- **Indian Traffic Congestion Pattern** — Hourly congestion chart reflecting IST peak hours
- **Weekly Delivery Trend** — Deliveries and on-time performance by day
- **Delivery Status Distribution** — Interactive pie chart
- **City Performance Cards** — Per-city on-time rate, avg time, revenue
- **Vehicle Type & Priority Distribution** — Bar charts

### Multi-City Operations
- 12 Indian cities supported:
  - **Metro:** Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune
  - **Tier-2:** Guwahati, Jaipur, Lucknow, Ahmedabad, Chandigarh
- Fleet utilization per city
- City-level delivery counts and performance metrics

### UI/UX
- Blue & green logistics theme
- Light & Dark mode with smooth switching
- Card-based clean SaaS design
- Mobile-first driver view
- Responsive sidebar navigation
- Push notification simulation (peak hour alerts, delivery updates)
- Search bar with global scope

---

## Indian Context

- Traffic-aware routing adjusts speed during Indian peak hours
- Metro vs Tier-2 city classification
- Indian addresses, pincodes, and phone number formats
- INR (₹) currency with COD support
- IST (UTC+5:30) timezone
- Realistic seed data with Indian names and city-specific delivery patterns

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analytics/route.ts    # Analytics & chart data
│   │   ├── cities/route.ts       # City list with counts
│   │   ├── deliveries/route.ts   # Delivery CRUD
│   │   ├── stats/route.ts        # Dashboard KPIs
│   │   └── vehicles/route.ts     # Fleet data
│   ├── globals.css               # Blue/green theme + dark mode
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main app (role-based routing)
├── components/
│   ├── logistics/
│   │   ├── app-header.tsx        # Top bar (search, notifications, theme, roles)
│   │   ├── app-sidebar.tsx       # Side navigation
│   │   └── views/
│   │       ├── analytics-view.tsx
│   │       ├── cities-view.tsx
│   │       ├── dashboard-view.tsx
│   │       ├── deliveries-view.tsx
│   │       ├── driver-view.tsx
│   │       ├── fleet-view.tsx
│   │       ├── settings-view.tsx
│   │       └── tracking-view.tsx
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── db.ts                     # Prisma client
│   └── utils.ts
├── stores/
│   ├── app-store.ts              # Global app state
│   ├── auth-store.ts             # Auth & role management
│   ├── delivery-store.ts         # Delivery state & filters
│   └── fleet-store.ts            # Fleet & GPS state
├── types/
│   └── logistics.ts              # TypeScript type definitions
mini-services/
└── tracking-service/
    ├── index.ts                  # Socket.IO GPS simulation server
    └── package.json
prisma/
└── schema.prisma                # Database schema (5 models)
scripts/
└── seed.ts                     # Indian cities, users, vehicles, deliveries
```

---

## Database Schema

| Model | Description |
|-------|-------------|
| **User** | Admin, Manager, Driver accounts with role and city |
| **City** | 12 Indian cities with coordinates and type (metro/tier2) |
| **Vehicle** | Fleet vehicles with GPS position, fuel stats, driver link |
| **Delivery** | Shipments with pickup/dropoff, status, priority, COD |
| **TrackingPoint** | GPS history per delivery |

---

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```

2. Push database schema and seed:
   ```bash
   bun run db:push
   bun run scripts/seed.ts
   ```

3. Start the tracking service:
   ```bash
   cd mini-services/tracking-service && bun run dev &
   ```

4. Start the dev server (auto-starts):
   ```bash
   bun run dev
   ```

5. Open the app and explore using the role switcher (top-right avatar) to switch between Admin, Manager, and Driver views.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard KPIs (deliveries, fleet, efficiency) |
| `/api/deliveries` | GET | All deliveries with relations |
| `/api/vehicles` | GET | All vehicles with drivers and active orders |
| `/api/cities` | GET | Cities with vehicle and delivery counts |
| `/api/analytics` | GET | Charts data (traffic, trends, distributions) |

---

## License

Private project — LogistiKAI © 2026
