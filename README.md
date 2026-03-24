## ArthMitra

ArthMitra is an AI-powered personal finance mentor for Indian users built with Next.js 14, Tailwind CSS, shadcn/ui, Firebase, Groq, Recharts, and Zustand.

## Stack

- Next.js 14 App Router with TypeScript
- Tailwind CSS + shadcn/ui primitives
- Firebase Auth + Firestore
- Groq `llama-3.3-70b-versatile` for AI analysis
- Recharts for FIRE, tax, health score, and portfolio visuals
- React Hook Form + Zod for validated auth flows

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
Copy-Item .env.example .env.local
```

3. Fill in Firebase and Groq credentials in `.env.local`.

4. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the local app
- `npm run build` creates the production build
- `npm run start` serves the production build
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript checks

## App Areas

- `/` landing page
- `/auth/login` and `/auth/signup` authentication
- `/onboarding` 3-step profile setup
- `/dashboard` main financial command center
- `/tools/fire` FIRE Path Planner
- `/tools/tax` Tax Wizard
- `/tools/health-score` Money Health Score
- `/tools/mf-xray` MF Portfolio X-Ray
- `/profile` saved profile and service status

## Notes

- AI routes include local deterministic fallbacks when Groq is unavailable.
- CAMS PDF parsing uses `pdfjs-dist` with a static worker served from `public/pdf.worker.mjs`.
- The app is designed for Vercel deployment.
