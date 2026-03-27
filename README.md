# ArthMitra — AI Personal Finance Mentor for India

> 95% of Indians don't have a financial plan. Financial advisors charge ₹25,000+/year and serve only HNIs.
> ArthMitra makes financial planning as accessible as checking WhatsApp — powered by AI, free for everyone.

ArthMitra is a full-stack AI-powered personal finance application that provides six intelligent financial tools, each backed by Groq's LLaMA 3.3 70B model. Users complete a 3-step onboarding (profile → finances → goals), and every tool instantly generates personalized, actionable financial advice — no human advisor needed.

---

## What It Does

ArthMitra includes **6 AI-powered financial tools:**

### 1. 🔥 FIRE Path Planner (`/tools/fire`)
Plan your Financial Independence, Retire Early journey.

- **Input:** Age, monthly income, expenses, savings, target retirement age, expected returns
- **Output:** Month-by-month FIRE roadmap with:
  - Corpus needed and recommended monthly SIP
  - Asset allocation (large cap, mid cap, debt, gold, emergency)
  - 20-year yearly projection chart
  - 4 actionable steps + AI narrative
- **How it works:** Your numbers are sent to the AI which calculates your exact FIRE gap, builds a SIP-based investment plan, and generates yearly corpus projections visualized as an interactive Recharts line chart.

### 2. 💚 Money Health Score (`/tools/health-score`)
A 5-minute financial wellness check-up.

- **Input:** Answer questions across 6 dimensions
- **Output:** Score out of 100 with grade (A–F) across:
  - Emergency preparedness, Insurance coverage, Investment diversification
  - Debt health, Tax efficiency, Retirement readiness
- **How it works:** Each answer is evaluated by the AI across all 6 dimensions. You see animated health bars filling up and color-coded feedback per dimension, plus top 3 priority actions.

### 3. 🧾 Tax Wizard (`/tools/tax`)
Find every deduction you're missing.

- **Input:** Gross income, 80C/80D/HRA deductions, home loan interest, NPS contribution, regime preference
- **Output:**
  - Side-by-side Old Regime vs New Regime tax breakdown
  - Which regime saves you more money
  - Missed deductions with exact savings amounts and actions
- **How it works:** The AI applies exact FY 2024-25 Indian tax slabs, calculates cess, and identifies tax-saving investment opportunities ranked by your risk profile.

### 4. 📊 MF Portfolio X-Ray (`/tools/mf-xray`)
Scan your mutual fund portfolio in 10 seconds.

- **Input:** Upload your CAMS/KFintech PDF statement OR enter funds manually
- **Output:**
  - Total invested vs current value with XIRR
  - Fund overlap matrix (which funds hold the same stocks)
  - Expense ratio analysis per fund
  - AI-generated rebalancing recommendations
- **How it works:** If you upload a CAMS PDF, the app parses it client-side using pdf.js, extracts fund names and amounts, then sends them to the AI for deep portfolio analysis.

### 5. ✨ Life Event Financial Advisor (`/tools/life-event`)
Big life change? Get a personalized financial game plan.

- **Input:** Select event (Bonus, Inheritance, Marriage, New Baby, Job Change, Home Purchase), amount involved, risk profile, tax bracket
- **Output:**
  - Immediate action cards with priority levels (red/orange/green)
  - Tax implications specific to the event
  - Portfolio rebalancing bar chart (current → recommended)
  - Month-by-month action timeline
  - AI narrative and warnings
- **How it works:** The AI considers your event type, amount, existing portfolio, risk tolerance, and tax bracket to generate a priority-ordered action plan with a visual timeline.

### 6. ❤️ Couple's Money Planner (`/tools/couples`)
India's first AI-powered joint financial optimizer.

- **Input:** Both partners enter: name, monthly income, employer NPS, existing SIPs, HRA claimed, rent paid. Plus combined loans and joint goals.
- **Output:**
  - Individual partner summary cards (income, tax rate, recommended SIP, NPS optimal, HRA benefit)
  - Combined net worth and recommended monthly investment
  - Optimized investment splits (who invests where for maximum tax efficiency)
  - Joint vs individual insurance recommendations
  - AI action steps and narrative
- **How it works:** The AI optimizes across both incomes — determining which partner should claim HRA, how to split SIPs for tax efficiency, optimal NPS contributions, and insurance coverage needed.

---

## How to Use the App

### Step 1: Sign Up
Go to `/auth/signup`. Create an account with email and password. You'll be redirected to onboarding.

### Step 2: Complete Onboarding (3 steps)
1. **Tell us about you** — Name, age, city, occupation
2. **Your money picture** — Monthly income, expenses, savings, investments, loans (with ₹ currency formatting)
3. **Your goals** — Select retirement age, risk profile, and primary financial goals

### Step 3: Explore Your Dashboard
The dashboard (`/dashboard`) shows:
- **Monthly Surplus** — Income minus expenses with animated count-up
- **Health Score** — Your financial wellness grade
- **FIRE Target Date** — When you can retire
- **Tax Savings** — How much you can save this year
- Smart insight cards linking to relevant tools

### Step 4: Use Any Tool
Navigate via the sidebar (desktop) or hamburger menu (mobile). Each tool has:
- **Left panel:** Form to input your data
- **Right panel:** AI-generated results with charts and actionable advice
- Results are saved to your Firestore profile automatically
- Toast notifications confirm when data is saved

---

## How to Run on Your Device

### Prerequisites
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **Firebase project** with Authentication (Email/Password) and Firestore enabled
- A **Groq API key** ([Get one free](https://console.groq.com/))

### Step 1: Clone the Repository
```bash
git clone https://github.com/shivamsinghtomar78/ArthMitra.git
cd ArthMitra
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq AI
GROQ_API_KEY=gsk_your_groq_api_key
```

### Step 4: Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Email/Password provider
4. Create a **Firestore Database** in `asia-south1` region
5. Publish these security rules in Firestore → Rules tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 5: Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Build for Production (Optional)
```bash
npm run build
npm run start
```

---

## How It Works (Architecture)

```
User → Landing Page → Sign Up → Onboarding (3 steps) → Dashboard → Tools
                                     ↓
                              Firebase Firestore
                              (profile, financials, results)

Tool Page:
  Form (user inputs)
    ↓
  POST /api/ai/{tool-name}
    ↓
  Zod Validation → Rate Limit Check (5/min) → Cache Check
    ↓                                            ↓
  Cache Hit → Return cached result          Cache Miss
                                                 ↓
                                          Groq AI (LLaMA 3.3 70B)
                                          with exponential backoff retry
                                                 ↓
                                          Parse JSON → Cache → Return
                                                 ↓ (if AI fails)
                                          Mathematical Fallback
    ↓
  Results Component (React.memo + Framer Motion animations)
    ↓
  Save to Firestore → Toast notification
```

### Key Architecture Decisions

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (App Router) | Server-side rendering, file-based routing, API routes |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first with accessible, pre-built components |
| **State** | Zustand | Lightweight, no boilerplate, works with Next.js |
| **Auth & DB** | Firebase Auth + Firestore | Google-backed, free tier, real-time sync |
| **AI** | Groq SDK (LLaMA 3.3 70B) | Fastest inference, JSON mode, free tier available |
| **Charts** | Recharts | React-native charting, composable, responsive |
| **Animations** | Framer Motion | Declarative, layout animations, stagger support |
| **PDF Parsing** | pdf.js | Client-side CAMS statement parsing, no server upload needed |
| **Validation** | Zod | Runtime type safety on every API input |

### Performance Features

| Feature | What it does |
|---------|-------------|
| **Lazy-loaded charts** | Recharts is loaded only when results appear (−32% bundle size) |
| **React.memo** | All 6 result components prevent re-renders during form typing |
| **useDeferredValue** | Currency inputs stay responsive on low-end devices |
| **PDF CDN Worker** | pdf.js worker loaded from CDN, not bundled |
| **Font self-hosting** | Inter + DM Sans served via next/font (no external CDN) |
| **Response caching** | Same inputs return cached AI responses (5-min TTL) |
| **Rate limiting** | 5 requests/min per user with Retry-After headers |
| **Exponential backoff** | AI calls retry up to 3 times with increasing delay |
| **Mathematical fallbacks** | Every tool has a local fallback if AI is unavailable |
| **Route transitions** | Smooth fade + slide-up between pages |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at localhost:3000 |
| `npm run build` | Create optimized production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## All Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with features grid and CTA |
| `/auth/login` | Email/password login |
| `/auth/signup` | Create new account |
| `/onboarding` | 3-step profile + financial + goals setup |
| `/dashboard` | Financial command center with animated metrics |
| `/tools/fire` | FIRE Path Planner |
| `/tools/tax` | Tax Wizard (Old vs New Regime) |
| `/tools/mf-xray` | Mutual Fund Portfolio X-Ray |
| `/tools/health-score` | Money Health Score (6 dimensions) |
| `/tools/life-event` | Life Event Financial Advisor |
| `/tools/couples` | Couple's Money Planner |
| `/profile` | Saved profile and settings |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** Firebase Auth (Email/Password)
- **Database:** Cloud Firestore
- **AI Model:** Groq — LLaMA 3.3 70B Versatile (JSON mode)
- **Charts:** Recharts (lazy-loaded)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **PDF Processing:** pdf.js (client-side)
- **Form Validation:** Zod + React Hook Form
- **Notifications:** Sonner toasts
- **Icons:** Lucide React
- **Fonts:** Inter + DM Sans (self-hosted via next/font)
- **Deployment:** Vercel-ready

---

## Deployment on Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add all `.env.local` variables in Vercel → Settings → Environment Variables
4. Deploy — Vercel auto-detects Next.js and handles everything

---

 