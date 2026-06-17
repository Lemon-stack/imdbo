# IMDB Auto-Fill Setup

## Prerequisites
- Neon PostgreSQL database
- OpenAI API key (for vision-capable models)

## Environment Setup

1. Create `.env.local` with:
```
DATABASE_URL="postgresql://user:password@host/database"
OPENAI_API_KEY="sk-..."
```

Get these from:
- **Neon**: https://console.neon.tech/ → Create project → Copy connection string
- **OpenAI**: https://platform.openai.com/api-keys

## Database Setup

1. Generate migrations:
```bash
pnpm db:generate
```

2. Apply migrations:
```bash
pnpm db:migrate
```

This creates the `submissions` table to store extracted product data.

## Development

```bash
pnpm dev
```

Visit http://localhost:3000

## File Structure

```
app/
├── page.tsx              # Landing page
├── dashboard/            # Results dashboard
├── api/submissions/      # Image extraction API
├── providers.tsx         # React Query setup
└── layout.tsx

components/
└── upload-form.tsx       # Image upload form (reusable)

hooks/
├── use-extract-image.ts  # Mutation for image processing
└── use-submissions.ts    # Query for fetching results

lib/
├── db/
│   ├── index.ts          # Drizzle connection
│   └── schema.ts         # Database schema
└── utils/
    ├── extract-from-image.ts  # OpenAI vision logic
    └── get-ip.ts              # IP tracking
```

## Key Features

- **IP Tracking**: Each submission tracked by user IP (no auth required)
- **Async Processing**: OpenAI vision extraction in API route
- **Data Persistence**: All 10 IMDB fields stored (barcode, brand, weight, packaging, etc.)
- **Confidence Scores**: Each extraction includes confidence metrics
- **Real-time Dashboard**: TanStack Query auto-refreshes results

## API Routes

### POST /api/submissions
Upload product image for extraction
- Request: `FormData` with `file` field
- Response: Extracted submission object with all IMDB fields

### GET /api/submissions
Fetch submissions for current user IP
- Response: Array of submission objects, sorted newest first

## Database Schema

```sql
submissions (
  id INT PRIMARY KEY,
  user_ip VARCHAR(45),
  barcode TEXT,
  category_type TEXT,
  segment_type TEXT,
  manufacturer TEXT,
  brand TEXT,
  product_name TEXT,
  weight_unit TEXT,
  packaging_type TEXT,
  country_of_origin TEXT,
  promotional_message TEXT,
  confidence JSONB,
  raw_extraction JSONB,
  created_at TIMESTAMP
)
```

## Notes

- No user authentication (IP-based tracking)
- Minimalist UI design (Tailwind CSS)
- Next.js 16 with TypeScript
- Shadcn/UI compatible setup (components.json configured)
