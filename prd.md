# AI Workflow Template Marketplace - Product Requirements Document

## Overview

A marketplace platform for simple-ai workflow templates where creators can submit, sell, and share pre-built AI workflows. The platform includes a certification program that verifies templates work correctly, providing buyers with confidence and quality assurance.

**Why this matters:** Users of simple-ai struggle to create effective workflows from scratch. They need proven, tested templates that solve real business problems. This marketplace bridges the gap between workflow builders and those who need them.

**Core Value Proposition:** Turn simple-ai from a toolkit into a solution platform. Users don't just get components—they get complete, certified, ready-to-deploy workflows.

---

## Target Audience

### Primary Users (Buyers)

- **Solo developers & indie hackers** building AI-powered features
- **Small agency teams** (3-10 people) delivering client projects
- **Product managers** at startups adding AI capabilities
- **No-code/low-code builders** who want pre-built AI workflows

**Their Pain Points:**

1. Don't know what AI workflows are possible or valuable
2. Spend days building workflows that could be copied in minutes
3. Unsure if a workflow will work in production
4. Want workflows specific to their industry (SaaS, e-commerce, content)

### Secondary Users (Creators)

- **AI workflow experts** who build workflows for clients
- **Developer advocates** at AI companies
- **Technical writers** creating educational content
- **Consultants** who want to productize their knowledge

**Their Motivation:**

1. Revenue share on template sales (70% to creator)
2. Build reputation and following in AI workflow community
3. Lead generation for consulting services
4. Passive income from reusable work

---

## Core Features

### 1. Template Discovery & Browsing

- **Categorized browsing** by industry, use case, complexity
- **Search** with filters (integrations used, AI model, pricing tier)
- **Preview mode** — See workflow structure before buying
- **Ratings & reviews** from verified purchasers
- **Usage stats** — How many teams use this template?

### 2. Template Submission System

- **Upload workflow JSON** from simple-ai
- **Metadata form** — Title, description, category, tags, pricing
- **Preview screenshots** — Auto-generated from workflow
- **Documentation editor** — Markdown-based setup instructions
- **Integration list** — What APIs/services does this need?

### 3. Certification Program

- **Automated testing** — Run workflow against test cases
- **Manual review** — QA team verifies quality and documentation
- **Performance benchmarking** — Execution time, cost per run
- **Security scan** — Check for exposed secrets, unsafe practices
- **Certification badges** — Bronze/Silver/Gold based on quality score

### 4. Purchase & Licensing

- **One-time purchase** — Buy template, own forever
- **Subscription access** — All templates for monthly fee
- **Team licenses** — Multi-seat pricing for agencies
- **Revenue dashboard** — Creators see sales, ratings, earnings

### 5. Community Features

- **Request board** — Users vote on templates they want
- **Creator profiles** — Portfolio of templates, reputation score
- **Comments & Q&A** — Discuss templates before/after purchase
- **Changelog tracking** — Updates to templates over time

---

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes + Server Actions
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Authentication:** Better-auth (social login: GitHub, Google)
- **File Storage:** UploadThing for screenshots and assets
- **Payments:** Stripe (subscriptions + one-time purchases)
- **Email:** Resend (purchase confirmations, notifications)
- **Search:** Algolia or PostgreSQL full-text search
- **Analytics:** PostHog or Plausible

---

## Architecture

### High-Level Flow

```
User browses templates → Previews workflow → Purchases → Downloads JSON
                                    ↓
Creator submits template → Automated tests → Manual review → Published
                                    ↓
                                    Certification badge assigned
```

### Key Components

**Template Registry Service**

- Stores workflow JSON, metadata, documentation
- Handles versioning (v1, v2, etc.)
- Manages certification state (pending, testing, certified, rejected)

**Certification Pipeline**

- Queue system for test execution
- Sandbox environment to run workflows safely
- Test case runner (validate inputs produce expected outputs)
- Manual review dashboard for QA team

**Marketplace Engine**

- Search indexing and ranking algorithm
- Recommendation engine ("users who bought X also bought Y")
- Pricing and licensing logic
- Revenue calculation and payout scheduling

**Creator Dashboard**

- Template management (edit, update, retire)
- Analytics (views, purchases, ratings, earnings)
- Payout settings and history

---

## Data Model

### Users

```typescript
{
  id: string,
  email: string,
  name: string,
  avatar: string,
  role: 'buyer' | 'creator' | 'admin',
  stripeCustomerId?: string,
  stripeConnectId?: string, // For creators
  createdAt: Date,
  updatedAt: Date
}
```

### Templates

```typescript
{
  id: string,
  creatorId: string,
  title: string,
  slug: string,
  description: string,
  category: 'support' | 'sales' | 'marketing' | 'operations' | 'development',
  tags: string[],
  price: number, // In cents, 0 = free
  pricingModel: 'one_time' | 'subscription',
  workflowJson: object, // The actual simple-ai workflow
  documentation: string, // Markdown
  previewImages: string[],
  integrations: string[], // ['slack', 'openai', 'notion']
  complexity: 'beginner' | 'intermediate' | 'advanced',
  certificationStatus: 'pending' | 'testing' | 'certified' | 'rejected',
  certificationBadge: 'none' | 'bronze' | 'silver' | 'gold',
  certificationNotes?: string,
  rating: number,
  reviewCount: number,
  purchaseCount: number,
  status: 'draft' | 'published' | 'archived',
  createdAt: Date,
  updatedAt: Date
}
```

### Purchases

```typescript
{
  id: string,
  userId: string,
  templateId: string,
  pricePaid: number,
  stripePaymentIntentId: string,
  licenseKey: string,
  status: 'active' | 'refunded' | 'disputed',
  createdAt: Date
}
```

### Reviews

```typescript
{
  id: string,
  userId: string,
  templateId: string,
  purchaseId: string,
  rating: number, // 1-5
  title: string,
  content: string,
  verifiedPurchase: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Certification Tests

```typescript
{
  id: string,
  templateId: string,
  testCases: Array<{
    name: string,
    input: object,
    expectedOutput: object,
    timeout: number
  }>,
  testResults: Array<{
    testCaseId: string,
    passed: boolean,
    actualOutput?: object,
    error?: string,
    executionTime: number
  }>,
  overallStatus: 'pending' | 'passed' | 'failed',
  securityScanResults: object,
  performanceMetrics: object,
  reviewedBy?: string, // Admin user ID
  reviewNotes?: string,
  createdAt: Date,
  completedAt?: Date
}
```

---

## UI/UX Requirements

### Public Pages

**Homepage**

- Hero: "Ready-to-deploy AI workflows"
- Featured/certified templates carousel
- Category browsing grid
- "How it works" explainer (3 steps)
- Creator CTA: "Earn from your workflows"

**Template Browse Page**

- Filter sidebar (category, price, complexity, integrations)
- Sort options (popular, newest, rating, price)
- Template cards with:
  - Preview image
  - Title + creator name
  - Certification badge
  - Rating + review count
  - Price
  - Key integrations (icon row)

**Template Detail Page**

- Large preview image gallery
- Certification badge prominently displayed
- "Preview workflow" — interactive graph view (read-only)
- Full description + documentation tabs
- Integration requirements list
- Reviews section
- Purchase CTA (primary action)
- "Add to wishlist" secondary action

**Creator Profile Page**

- Creator bio + stats (templates published, total sales, rating)
- Grid of their templates
- "Contact for custom work" button

### Authenticated Pages

**Dashboard (Buyers)**

- Purchased templates library
- Recent activity feed
- Recommended templates
- Wishlist

**Creator Dashboard**

- Stats cards: Total earnings, template views, purchases, rating
- Template management table
- Submit new template flow
- Earnings history and payout schedule

**Admin Dashboard**

- Certification queue (pending templates)
- Test execution status
- User management
- Dispute/refund handling

### Submission Flow

1. Upload workflow JSON (drag-drop or paste)
2. Auto-extract: integrations used, node count, complexity estimate
3. Fill metadata: title, description, category, tags, pricing
4. Add documentation (rich text editor)
5. Preview before submit
6. Submit for certification (agree to terms)
7. Confirmation: "Your template is in the certification queue"

---

## Security Considerations

### Authentication & Authorization

- Better-auth with social providers (GitHub, Google)
- JWT tokens with secure httpOnly cookies
- Role-based access control (buyer, creator, admin)

### Data Protection

- Workflow JSONs are assets — validate structure on upload
- Stripe for all payment handling (PCI compliance)
- No storage of API keys in templates (users configure their own)

### Content Safety

- Moderation queue for new templates
- Report system for inappropriate content
- Automated scan for malicious code in workflows

### Certification Security

- Sandboxed test environment (isolate workflow execution)
- Rate limiting on test runs
- Secret scanning in workflow JSON (detect exposed keys)

---

## Third-Party Integrations

### Required

- **Stripe** — Payments, subscriptions, creator payouts
- **UploadThing** — File uploads for screenshots/assets
- **Resend** — Transactional emails
- **simple-ai** — Template format compatibility

### Optional/Phase 2

- **Algolia** — Advanced search (if Postgres search insufficient)
- **PostHog** — Product analytics
- **Discord** — Community notifications
- **GitHub OAuth** — Primary auth method for developers

---

## Success Criteria

### Launch Milestones

- [ ] 50+ templates in marketplace at launch
- [ ] 10 certified templates (Gold/Silver)
- [ ] 100 registered users
- [ ] $1,000 in total GMV

### 3-Month Goals

- [ ] 500+ templates
- [ ] 100+ creators earning revenue
- [ ] $10,000 monthly GMV
- [ ] 4.5+ average template rating

### 6-Month Goals

- [ ] 2000+ templates
- [ ] 50 templates with 100+ purchases each
- [ ] Top creator earning $5,000+/month
- [ ] Certification program recognized as industry standard

---

## Constraints & Assumptions

### Technical Constraints

- Must work with simple-ai workflow JSON format
- Certification tests run in isolated environment (containerized)
- Search must be fast (<200ms) even with 1000+ templates

### Business Constraints

- 70% revenue share to creators (industry standard)
- Payouts monthly with $50 minimum threshold
- Stripe Connect required for creator onboarding

### Assumptions

- simple-ai continues to grow in popularity
- Creators will submit quality templates for revenue opportunity
- Buyers prefer certified templates over uncertified (even at premium)
- Template marketplace model has been validated (Envato, Figma Community)

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize Next.js project with shadcn/ui and configure base dependencies",
    "steps": [
      "Scaffold Next.js 15 project with TypeScript",
      "Install and configure shadcn/ui components",
      "Set up Tailwind CSS v4 with custom theme",
      "Configure ESLint and Prettier",
      "Install essential dependencies: drizzle-orm, better-auth, zod, react-hook-form"
    ],
    "passes": true
  },
  {
    "category": "setup",
    "description": "Configure database schema with Drizzle ORM",
    "steps": [
      "Set up PostgreSQL connection (Neon)",
      "Create Drizzle schema files for all entities",
      "Generate and run initial migration",
      "Create database seed script for development",
      "Set up Drizzle Studio for local DB management"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement authentication with Better-auth",
    "steps": [
      "Configure Better-auth with social providers (GitHub, Google)",
      "Create auth middleware and protected routes",
      "Build login/signup pages with auth cards",
      "Implement role-based access (buyer, creator, admin)",
      "Create user profile management page"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Build template browsing and discovery",
    "steps": [
      "Create template browse page with filters",
      "Implement category and tag system",
      "Build template card component with preview",
      "Add search functionality with debouncing",
      "Create pagination and infinite scroll"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Build template detail page",
    "steps": [
      "Create template detail layout with tabs",
      "Build workflow preview component (read-only React Flow)",
      "Add documentation viewer with markdown",
      "Implement reviews section",
      "Create purchase CTA and wishlist button"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement template submission system",
    "steps": [
      "Create submission form with workflow upload",
      "Build metadata editor (title, description, pricing)",
      "Add documentation rich text editor",
      "Implement preview before submit",
      "Create submission success and status tracking"
    ],
    "passes": true
  },
  {
    "category": "integration",
    "description": "Integrate Stripe for payments",
    "steps": [
      "Set up Stripe account and webhook handling",
      "Create checkout flow for one-time purchases",
      "Implement subscription plans",
      "Set up Stripe Connect for creator onboarding",
      "Build billing dashboard for users"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Build certification system core",
    "steps": [
      "Create certification status workflow (pending → testing → certified)",
      "Build automated test case runner",
      "Implement sandbox environment for workflow execution",
      "Create admin review dashboard",
      "Add certification badge display system"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Create creator dashboard",
    "steps": [
      "Build earnings overview with stats cards",
      "Create template management table",
      "Add analytics (views, purchases, ratings)",
      "Implement payout settings and history",
      "Build submission tracking view"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Build buyer dashboard",
    "steps": [
      "Create purchased templates library",
      "Implement template download with license key",
      "Add wishlist functionality",
      "Build review submission flow",
      "Create recommendation section"
    ],
    "passes": true
  },
  {
    "category": "integration",
    "description": "Add email notifications with Resend",
    "steps": [
      "Set up Resend account and domain",
      "Create email templates (purchase confirmation, certification update)",
      "Implement email sending service",
      "Add notification preferences for users",
      "Test all email flows"
    ],
    "passes": true
  },
  {
    "category": "styling",
    "description": "Polish UI and responsive design",
    "steps": [
      "Ensure all pages are mobile responsive",
      "Add loading states and skeleton screens",
      "Implement error boundaries and 404 pages",
      "Add animations and micro-interactions",
      "Final accessibility audit (keyboard nav, ARIA labels)"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Testing and QA",
    "steps": [
      "Write unit tests for critical functions",
      "Set up Playwright for E2E testing",
      "Test Stripe payment flows in test mode",
      "Verify email delivery",
      "Performance testing (Lighthouse audit)"
    ],
    "passes": true
  }
]
```

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find next task with `"passes": false`
3. Complete all steps for that task
4. Verify in browser using agent-browser
5. Update task to `"passes": true`
6. Log completion in `activity.md`
7. Repeat until all tasks pass

**Important:** Only modify the `passes` field. Do not remove or rewrite tasks.

### Development Priorities

**Phase 1 (MVP):**

1. Auth + database setup
2. Template browsing + detail pages
3. Basic template submission (manual approval)
4. Stripe checkout for one-time purchases
5. Creator/buyer dashboards

**Phase 2 (Certification):**
6. Automated testing pipeline
7. Certification badge system
8. Advanced search
9. Review system

**Phase 3 (Scale):**
10. Subscription plans
11. Community features (comments, requests)
12. Analytics and recommendations
13. Admin tools

### Key Technical Decisions

- Use **Drizzle ORM** with **Neon PostgreSQL** (already in Titan template)
- Use **Better-auth** for authentication (already in Titan template)
- Use **shadcn/ui** for consistent component library
- Use **UploadThing** for file uploads (simpler than S3)
- Use **Stripe** for payments (industry standard)
- Use **Resend** for emails (developer-friendly, good deliverability)

### Code Organization

```
app/
  (marketing)/           # Public pages
    page.tsx            # Homepage
    templates/
      page.tsx          # Browse
      [slug]/
        page.tsx        # Template detail
  (dashboard)/          # Authenticated pages
    dashboard/
      page.tsx          # User dashboard
    creator/
      page.tsx          # Creator dashboard
      submit/
        page.tsx        # Submit template
    admin/
      page.tsx          # Admin dashboard
  api/                  # API routes
    auth/               # Better-auth routes
    templates/          # Template CRUD
    purchases/          # Purchase handling
    webhooks/           # Stripe webhooks
components/
  templates/            # Template-related components
  ui/                   # shadcn/ui components
lib/
  db/                   # Drizzle schema and client
  auth.ts               # Better-auth config
  stripe.ts             # Stripe client
  email.ts              # Email service
```

---

## Completion Criteria

All tasks marked with `"passes": true` and verified through manual testing:

- [ ] User can sign up, browse templates, and purchase
- [ ] Creator can submit template and track status
- [ ] Admin can review and certify templates
- [ ] Stripe payments work end-to-end
- [ ] Emails send correctly
- [ ] All pages are responsive and accessible
- [ ] Performance: Page load < 2s, API response < 500ms
