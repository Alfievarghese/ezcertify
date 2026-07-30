# EzCertify — Bulk Certificate Generator

A production-grade platform for bulk certificate generation with a visual canvas editor, Excel data binding, QR verification, and server-side batch rendering.

## Features

- **Excel Upload**: Supports .xlsx, .xls, .csv — auto-detects headers, validates data
- **Visual Canvas Editor**: Drag-and-drop text placeholders bound to Excel columns
- **QR Verification**: Each certificate gets a unique QR code linked to a verification page
- **Server-Side Rendering**: Generates certificates using node-canvas (not in-browser)
- **Batch Processing**: BullMQ job queue handles 500+ certificates with real-time progress
- **Data Minimization**: Only verification records persist; Excel data and generated files auto-expire

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Fabric.js 6, Tailwind CSS, Framer Motion |
| Backend | Node.js 20+, Fastify, node-canvas |
| Database | PostgreSQL 16 (verification records only) |
| Queue | BullMQ + Redis 7 |
| QR | qrcode npm package |

## Quick Start

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for PostgreSQL + Redis)
- (Windows) `windows-build-tools` for node-canvas native compilation

### 1. Clone & Install

```bash
git clone https://github.com/Alfievarghese/ezcertify.git
cd ezcertify
cp .env.example .env
npm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

### 4. Start Development

```bash
npm run dev
```

This starts both the frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

## Project Structure

```
ezcertify/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/       # Landing, Editor, Generate, Verify
│       ├── components/  # Canvas editor, UI components
│       ├── hooks/       # useCanvas, useExcelData
│       └── context/     # Editor state management
├── server/          # Fastify backend
│   └── src/
│       ├── routes/      # Upload, Generate, Verify APIs
│       ├── services/    # Excel parser, Renderer, QR generator
│       ├── queue/       # BullMQ worker + processor
│       ├── db/          # Drizzle schema + migrations
│       └── jobs/        # Cleanup/retention jobs
└── docker-compose.yml
```

## Architecture

The application follows a clean separation:

1. **Client** builds the certificate layout visually using Fabric.js
2. The layout is serialized as JSON (positions, fonts, colors, bindings)
3. **Server** recreates the exact layout using `fabric/node` + `node-canvas`
4. BullMQ workers render certificates in parallel across CPU cores
5. Results are streamed into a zip file for download
6. Minimal verification records persist in PostgreSQL for QR scanning

## Data Privacy

- Excel files are parsed in memory and discarded after generation
- Generated certificates auto-delete after 48 hours
- Only verification records (certificateId + bound field value) persist
- No personal data in application logs

## License

MIT
