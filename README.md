# ProspectSync Server - Node.js

Node.js implementation of ProspectSync Server, migrated from Go.

## Getting Started

### Prerequisites

- Node.js v20 or higher
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy `.env` file from project root or create one based on `.env.example`

3. Generate Prisma client:

```bash
npm run prisma:generate
```

### Running

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

Watch mode (auto-reload):

```bash
npm run watch
```

## Project Structure

```
node/
├── src/
│   ├── main.ts              # Entry point
│   ├── config/              # Configuration
│   ├── server/              # Express server setup
│   ├── router/              # Route definitions
│   ├── middleware/          # Express middleware
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Database access
│   ├── models/              # TypeScript types
│   ├── eventbus/            # Event system
│   ├── listeners/           # Event listeners
│   ├── scheduler/          # Cron jobs
│   ├── utils/               # Utilities
│   └── ai/                  # AI integration
└── prisma/                  # Prisma schema
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/scan/document` - Scan PDF document
- `POST /api/scan/job-posting` - Scan job posting from URL
- `POST /api/scan/repo` - Scan repository (placeholder)
- `POST /api/analyze/repository` - Analyze GitHub repository (placeholder)
- `POST /api/job-posting/create` - Create job posting (TODO)
- `GET /api/job-posting/show` - Show job posting (TODO)
- `PATCH /api/job-posting/update` - Update job posting (TODO)
- `DELETE /api/job-posting/delete` - Delete job posting (TODO)

## Environment Variables

See `.env.example` for all required environment variables.

## Development

The project uses TypeScript with strict mode enabled. Make sure to:

1. Run `npm run build` to check for TypeScript errors
2. Use `npm run watch` for development with auto-reload
3. Follow the router → middleware → controller → service → repository pattern

## Notes

- This is a migration from Go to Node.js
- All business logic should match the Go version exactly
- OOP pattern with classes is used throughout
- Prisma is used for database access instead of raw SQL
