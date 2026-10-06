# SHARADIYA CIRCUIT — AEC Hardware Club

A high-performance, real-time hardware quiz and circuit competition platform built for the **AEC Hardware Club**.

> **"Where Tradition Meets Technology"**  
> 25 Questions • 120 Seconds • One Attempt

---

## ⚡ Features

- **Authoritative Server Timing**: Server-enforced countdown with anti-cheat state verification and auto-submission upon timeout.
- **Dynamic 3D & 2D Hardware Visualizers**: Interactive WebGL 3D meshes and circuit diagrams for electronics components (Resistors, Capacitors, LEDs, Breadboards, Logic Gates, Microcontrollers, and Sensors).
- **Sticky Glass Navigation HUD**: Fluid, glassmorphic floating navigation with live status beacons.
- **Admin Control Center**:
  - Live session monitor with real-time participation metrics.
  - Quiz edition management (timing, question limits, start/stop schedules).
  - Question bank creator & CSV importer/exporter.
  - Full audit logs & security telemetry.
  - Winner publication and automated notification dispatch.
- **Real-Time Podium & Leaderboards**: Live participant rankings, accuracy analytics, and ceremony cards.
- **Google Sheets & Email Webhooks**: Two-way integration for syncing participant records, answer scripts, and email dispatch.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm` or `bun`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the optional environment variables as needed:
```env
PORT=3000
GOOGLE_SHEETS_SPREADSHEET_ID=""
GOOGLE_SHEETS_WEBHOOK_URL=""
```

### 3. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm start
```

---

## 🛡️ Security & Privacy

- Client-side code receives **only** sanitized question payloads without `correctAnswer` keys.
- Scoring, answer evaluations, and timer validation are authoritatively computed on the backend server.
- Participant data and answer scripts are secured in Firestore with strict schema and role validation.

---

## 📜 License & Attribution

© 2026 **AEC Hardware Club**. Built with curiosity, circuits & code.
