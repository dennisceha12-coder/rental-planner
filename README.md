# Rental Planner

Kleinschalige verhuurplanning: klussen, materiaal, personeelsplanning, offertes en callsheets.

## Lokaal draaien

```bash
npm install
npx prisma migrate dev
npm run db:seed   # optioneel — demo-data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Eerste stappen

1. **Bedrijf** (`/settings`) — vul leveranciergegevens in (KvK, BTW, IBAN) voor offertes
2. **Catalogus** — materiaal met dagtarieven
3. **Team** — teamleden voor personeelsplanning
4. **Nieuwe klus** — materiaal, personeel, transport → documenten printen

## Deploy op Railway

SQLite vereist persistent storage. Gebruik Railway (niet Vercel serverless).

1. Maak project op [railway.app](https://railway.app) en koppel deze GitHub-repo
2. Voeg een **Volume** toe, mount op `/data`
3. Environment variable: `DATABASE_URL=file:/data/dev.db`
4. Deploy (Dockerfile wordt automatisch gebruikt via `railway.toml`)
5. Optioneel na eerste deploy: Railway shell → `npm run db:seed`

## Documenten per klus

| Document | Route |
|----------|--------|
| Offerte | `/print/[id]/offerte` |
| Callsheet | `/print/[id]/callsheet` |
| Personeelsplanning | `/print/[id]/personeel` |
| Materiaallijst | `/print/[id]/materiaallijst` |

Print via Ctrl+P / Cmd+P → PDF.

## Tech stack

Next.js 16, React 19, Prisma 7, SQLite (better-sqlite3), Tailwind v4.
