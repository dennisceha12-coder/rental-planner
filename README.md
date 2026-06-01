# Rental Planner

Kleinschalige verhuurplanning: projecten, materiaal, personeelsplanning, offertes en callsheets.

## Lokaal draaien

1. Maak een gratis database op [Neon](https://neon.tech)
2. Kopieer `.env.example` naar `.env` en vul `DATABASE_URL` + `DIRECT_URL` in
3. Installeer en start:

```bash
npm install
npx prisma migrate dev
npm run db:seed   # optioneel — demo-data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Eerste stappen in de app

1. **Bedrijf** (`/settings`) — leveranciergegevens voor offertes
2. **Catalogus** — materiaal met dagtarieven
3. **Team** — teamleden voor personeelsplanning
4. **Nieuw project** — materiaal, personeel, transport, korting → documenten printen

## Deploy op Vercel + Neon (gratis)

### 1. Neon database

1. [neon.tech](https://neon.tech) → nieuw project
2. Kopieer **pooled connection string** → `DATABASE_URL`
3. Kopieer **direct connection string** → `DIRECT_URL` (voor migrations)

### 2. Vercel project

1. [vercel.com](https://vercel.com) → Import GitHub repo `rental-planner`
2. Environment variables:
   - `DATABASE_URL` — pooled Neon URL
   - `DIRECT_URL` — direct Neon URL
3. Deploy — `vercel.json` draait `prisma migrate deploy` vóór de build

### 3. Na deploy

- Open je Vercel URL → `/settings` invullen
- Optioneel: lokaal `npm run db:seed` tegen de Neon DB (zelfde `DATABASE_URL` in `.env`)

## Documenten per project

| Document | Route |
|----------|--------|
| Offerte | `/print/[id]/offerte` |
| Callsheet | `/print/[id]/callsheet` |
| Personeelsplanning | `/print/[id]/personeel` |
| Materiaallijst | `/print/[id]/materiaallijst` |

Print via Ctrl+P / Cmd+P → PDF.

## Tech stack

Next.js 16, React 19, Prisma 7, PostgreSQL (Neon), Tailwind v4.
