# BillCraft ⚡

**AI Invoice & Proposal Generator for Indian Freelancers**

Paste your messy project notes — even in Hinglish — and get a professional, GST-compliant invoice or proposal PDF in 60 seconds.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **AI-Powered Generation** — Paste a brain dump, get a polished document. Powered by Gemini 2.5 Flash (free tier) with Groq Llama 3.3 70B fallback
- **GST-Compliant Invoices** — Automatic CGST/SGST/IGST calculation, GSTIN fields, HSN/SAC codes
- **Professional Proposals** — Scope, deliverables, timeline, payment terms — client-ready
- **5 Niche Templates** — Designer, Developer, Consultant, Photographer, Writer — each with industry-specific language
- **Hinglish Input** — Understands code-switching like *"Rohit ke liye website banaya — 45k total"*
- **Smart Client Memory** — Auto-saves client details from past generations
- **60-Second Turnaround** — What used to take 30–90 minutes, done in under a minute

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| AI (Primary) | Google Gemini 2.5 Flash — free tier |
| AI (Fallback) | Groq Llama 3.3 70B — free tier |
| Auth & DB | Supabase (PostgreSQL + Auth + Storage) |
| PDF | @react-pdf/renderer |
| Email | Resend |
| Payments | Razorpay |
| Deployment | Vercel (free tier) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Ashtorments/billcraft.git
cd billcraft

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys (see below)

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app works with mock data even without API keys.

### Environment Variables

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `GEMINI_API_KEY` | Recommended | [aistudio.google.com](https://aistudio.google.com) (free) |
| `GROQ_API_KEY` | Optional | [console.groq.com](https://console.groq.com) (free fallback) |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/DB | [supabase.com](https://supabase.com) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/DB | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | For server ops | Supabase project settings |
| `RESEND_API_KEY` | For email | [resend.com](https://resend.com) |
| `RAZORPAY_KEY_ID` | For payments | [razorpay.com](https://razorpay.com) |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay dashboard |

### Database Setup

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor to create all tables, RLS policies, and triggers.

## 📁 Project Structure

```
billcraft/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── generate/page.tsx     # Core generator (main product)
│   │   ├── dashboard/page.tsx    # Document history + stats
│   │   ├── settings/page.tsx     # Business profile setup
│   │   ├── pricing/page.tsx      # Pricing tiers + FAQ
│   │   └── api/
│   │       └── generate/route.ts # AI generation endpoint
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PricingCard.tsx
│   └── lib/
│       ├── ai/
│       │   ├── generate.ts       # Gemini → Groq → mock fallback
│       │   ├── prompts.ts        # 5 niche-specific system prompts
│       │   └── schema.ts         # Zod schemas for output validation
│       ├── supabase/
│       │   ├── client.ts         # Browser client
│       │   └── server.ts         # Server client
│       ├── constants.ts          # App config, GST codes, categories
│       ├── gst.ts                # GST calculation logic
│       ├── invoice-number.ts     # Auto-increment doc numbers
│       └── utils.ts              # Helpers (cn, formatCurrency, formatDate)
├── supabase/
│   └── schema.sql                # Full DB schema with RLS
├── .env.local.example            # Environment variable template
└── package.json
```

## 💰 Pricing Model

| Plan | Price | Highlights |
|------|-------|-----------|
| Free | ₹0/forever | 3 docs/month, PDF download, basic templates |
| Pro | ₹199/mo | Unlimited docs, GST invoices, custom branding, email to client |
| Agency | ₹499/mo | Team members, payment reminders, client portal, API access |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for Indian freelancers** · [BillCraft](https://billcraft.vercel.app)
