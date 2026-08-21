# 🛡️ CrowdShield — Crowd Safety & Event Command Center

> **AI & Rule-Powered Decision Support System for Real-Time Crowd Density, Risk Analysis, and Incident Response.**

---

## 📌 Problem Statement

Mass gatherings at stadiums, arenas, and large public events face constant risks of **crowd density surges**, **exit bottlenecks**, and **counter-flow stampedes**. Traditional security control rooms rely on manual camera monitoring, leading to delayed responses during critical emergencies.

## 💡 Solution

**CrowdShield** turns venue telemetry into proactive decision support:
1. **Visualizes live venue status** in a 3D schematic map with density height extrusion and real-time risk pulsing.
2. **Calculates quantitative risk scores (0–100)** using a rule-based risk engine evaluating density, flow rates, capacity, and active incidents.
3. **Generates actionable AI command recommendations** for control room operators.
4. **Enables immediate operator action** (dispatching teams, executing rerouting protocols, resolving incidents) with complete audit logging.

---

## ✨ Key Features

- **🌐 Live 3D Venue Model (Three.js & React Three Fiber)**
  - Dynamic 3D extrusion scaling with crowd density.
  - Emissive wireframe pulsing for `CRITICAL` and `ELEVATED` risk zones.
  - Floating 3D HTML telemetry overlays hovering over monitored sectors.
  - Interactive camera targeting: click any zone or 3D incident marker to focus.

- **🧮 Rule-Based Risk Engine (`/api/risk`)**
  - Evaluates telemetry signals: Density %, Flow (people/min), Capacity %, and Incident counts.
  - Maps numerical scores to 4 operational levels: `SAFE` (0-44), `CAUTION` (45-64), `WARNING` (65-79), `DANGER` (80-100).
  - Dynamically constructs explanation strings and suggested command actions.

- **⚡ Real-Time Data & Resilient Architecture**
  - **Supabase Database Integration** for persistent storage (`events`, `zones`, `incidents`, `recommendations`, `kpis`, `trend_snapshots`).
  - **Zero-Downtime Mock Fallback**: If database credentials are empty or offline, the app seamlessly runs on local telemetry.
  - **Background Live Sync**: Automatic 5-second polling with manual sync trigger and live status indicator (`GET /api/health`).

- **🛡️ Command Actions & Role-Based Access Control (RBAC)**
  - 3 Operator Role Profiles:
    - **Security / Police** (`Cmdr. A. Rhodes`) — Full action execution & incident dispatch authority.
    - **Event Organizer** (`Elena Vance`) — Read-only venue monitoring.
    - **Administrator** (`SysAdmin Alex`) — Full system setup & override control.
  - Interactive incident resolution & protocol execution with a live **Command Audit Log**.

---

## 🏗️ System Architecture

```text
                               ┌────────────────────────────────────────────────┐
                               │             CrowdShield Frontend               │
                               │  (Next.js 16 App Router + React Three Fiber)   │
                               └───────────────────────┬────────────────────────┘
                                                       │
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │             Next.js API Layer                  │
                               │  /api/zones  /api/incidents  /api/risk  etc.  │
                               └───────────┬────────────────────────┬───────────┘
                                           │                        │
                                  (Configured & Online)      (Offline / Fallback)
                                           │                        │
                                           ▼                        ▼
                               ┌──────────────────────┐  ┌─────────────────────┐
                               │   Supabase Postgres  │  │ Local Mock Engine   │
                               │  (Row Level Sec Key) │  │  (Live Variance)    │
                               └──────────────────────┘  └─────────────────────┘
```

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **3D Visualization**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://drei.docs.pmnd.rs/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), Lucide Icons
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **State & Hooks**: React Context, Custom Polling Hooks

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ or 20+
- `pnpm` (recommended) or `npm`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/crowdshield.git
cd crowdshield
pnpm install
```

### 2. Configure Environment Variables (Optional for Supabase)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

If connecting to Supabase:
```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
> *Note: If `.env.local` keys are empty, CrowdShield runs on built-in mock telemetry.*

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase)

1. Open your Supabase project's **SQL Editor**.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) to create tables (`events`, `zones`, `incidents`, `recommendations`, `kpis`, `trend_snapshots`) and seed demo data.
3. Run [`supabase/verify.sql`](./supabase/verify.sql) to confirm table counts and Row Level Security settings.
4. Visit `http://localhost:3000/api/health` to verify server-side database connectivity.

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/event` | `GET` | Returns active event metadata and capacity stats |
| `/api/zones` | `GET` | Returns zone array with density, flow rates, and risk levels |
| `/api/incidents` | `GET` | Returns active incident queue sorted by timestamp |
| `/api/recommendations` | `GET` | Returns dynamic AI command recommendations per zone |
| `/api/dashboard` | `GET` | Returns aggregate KPI cards and historical analytics trends |
| `/api/risk` | `GET` | Returns complete output from the Rule-Based Risk Engine |
| `/api/health` | `GET` | Returns Supabase database connection and schema health |

---

## 🎭 Hackathon Demonstration Story Script

When presenting CrowdShield to judges, follow this live demonstration path:

1. **Overview View**: Show the live 3D venue map monitoring Metro Arena's Championship Final (38,300 attendees).
2. **Detection**: Point out **Zone A (North Gate)** highlighted in **RED (CRITICAL Risk - 92% density, 2,340 people/min flow)** with pulsing 3D wireframe and 3D hazard pin.
3. **Decision Support**: Click Zone A on the 3D map. Watch the camera smoothly focus target to Zone A. Review the **AI Command Recommendation** card detailing reasons and suggested actions (*"Open Gate 4 to relieve exit pressure"*).
4. **Role Permission**: Switch operator role in TopNav to `Event Organizer`. Note that action execution buttons lock for security. Switch back to `Security / Police` (`Cmdr. A. Rhodes`).
5. **Action & Audit**: Click **Execute** on the recommendation card. Observe the status change to `"Protocol Executed"` and see the timestamped action recorded live in the **Command Audit Log**.
6. **Incident Resolution**: Click **Resolve** on Incident `#inc-1`. Notice the active incident count update live across the dashboard.

---

## 🔒 Security Best Practices

- `SUPABASE_SERVICE_ROLE_KEY` is kept **server-only** using the `server-only` package and is never exposed to browser code.
- `.env*.local` is explicitly ignored by `.gitignore`.
- Row Level Security (RLS) is enabled across all Supabase tables without public read policies.

---

## 📄 License

This project was developed for the hackathon and is available under the [MIT License](./LICENSE).
