# Agent Prompt for AI Workflow Template Marketplace

## Project Overview

Building an **AI Workflow Template Marketplace** — a platform where creators can submit, sell, and share pre-built simple-ai workflow templates. Includes a certification program that verifies templates work correctly.

**Core Tech Stack:**

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL (Neon) + Drizzle ORM
- Better-auth (GitHub, Google OAuth)
- Stripe (payments + payouts)
- Resend (emails)
- UploadThing (file uploads)

**Start Command:**

```bash
bun dev
```

**Build Command:**

```bash
bun run build
```

**Database Commands:**

```bash
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
```

**Lint Command:**

```bash
bun run lint
```

---

## Project-Specific Instructions

### Architecture Patterns

1. **Use Server Actions for mutations** — All form submissions, purchases, and template submissions should use Next.js Server Actions
2. **Use API routes for webhooks** — Stripe webhooks need dedicated API routes
3. **Drizzle ORM patterns** — All database queries go through Drizzle schema in `src/lib/db/`
4. **Better-auth integration** — Auth is pre-configured, use `auth()` helper for session checks
5. **shadcn/ui components** — Use the registry for UI components, customize as needed

### Key Implementation Notes

**Template Data Structure:**

- Templates store workflow JSON from simple-ai
- Include metadata: title, description, category, price, integrations
- Preview images uploaded via UploadThing
- Documentation stored as markdown

**Certification Flow:**

1. Creator submits template
2. Status = 'pending'
3. Automated tests run (validate JSON structure, check for secrets)
4. Admin reviews manually
5. Status = 'certified' + badge assigned (bronze/silver/gold)

**Payment Flow:**

1. User clicks "Purchase" on template detail page
2. Create Stripe Checkout Session
3. Redirect to Stripe
4. Webhook confirms payment
5. Grant license to user (create Purchase record)
6. User can download template JSON

**Creator Revenue:**

- 70% to creator, 30% to platform
- Stripe Connect for creator payouts
- Monthly payouts with $50 minimum

### File Organization

```
src/
  app/
    (marketing)/
      page.tsx                 # Homepage
      templates/
        page.tsx               # Browse templates
        [slug]/page.tsx        # Template detail
    (dashboard)/
      dashboard/page.tsx       # Buyer dashboard
      creator/
        page.tsx               # Creator dashboard
        submit/page.tsx        # Submit template
      admin/page.tsx           # Admin dashboard
    api/
      webhooks/stripe/route.ts # Stripe webhooks
  components/
    templates/                 # Template cards, previews
    ui/                        # shadcn/ui components
  lib/
    db/
      schema.ts                # Drizzle schema
      index.ts                 # Database client
    auth.ts                    # Better-auth config
    stripe.ts                  # Stripe client config
    email.ts                   # Resend email service
  types/
    index.d.ts                 # TypeScript types
```

### Environment Variables Needed

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend
RESEND_API_KEY="re_..."

# UploadThing
UPLOADTHING_TOKEN="..."
```

---

## Development Workflow

1. Read `activity.md` to see current state
2. Check `prd.md` for the next uncompleted task
3. Implement the task following the steps
4. Test in browser (verify UI, interactions, API calls)
5. Update task in `prd.md` to `"passes": true`
6. Log progress in `activity.md`
7. Continue to next task

### Testing Checklist

Before marking a task complete, verify:

- [ ] Feature works in browser (manual test)
- [ ] No console errors
- [ ] Responsive on mobile and desktop
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No lint errors (`bun run lint`)

### Critical Paths to Test

1. **Purchase flow:** Browse → View template → Purchase → Download
2. **Submission flow:** Creator uploads → Fills form → Submits → Appears in admin queue
3. **Auth flow:** Sign up → Login → Access protected pages
4. **Admin flow:** Review pending → Run tests → Certify → Template gets badge

---

## Common Issues & Solutions

**Issue:** Drizzle migrations failing
**Solution:** Check DATABASE_URL format, ensure Neon database is active

**Issue:** Stripe webhooks not working locally
**Solution:** Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Issue:** UploadThing uploads failing
**Solution:** Verify UPLOADTHING_TOKEN is correct and domain is configured

**Issue:** Better-auth session not persisting
**Solution:** Check BETTER_AUTH_SECRET is set and cookies are configured correctly

---

## External Dependencies

- **Neon PostgreSQL** — Sign up at neon.tech, create database, get connection string
- **Stripe** — Create account, enable Connect for marketplace, get API keys
- **Resend** — Sign up at resend.com, verify domain, get API key
- **UploadThing** — Sign up at uploadthing.com, create app, get token
- **GitHub OAuth** — Create OAuth app in GitHub settings
- **Google OAuth** — Create project in Google Cloud Console, enable OAuth

---

## Design References

- **shadcn/ui components:** <https://ui.shadcn.com/components>
- **simple-ai:** <https://www.simple-ai.dev/docs>
- **Titan template (base):** This project extends the Titan starter

Use shadcn/ui components wherever possible. Customize colors and styling to match a professional marketplace aesthetic (clean, modern, trustworthy).

---

## Success Criteria

The project is complete when:

1. Users can browse, search, and filter templates
2. Users can purchase templates (one-time payment)
3. Creators can submit templates for review
4. Admin can certify templates with badges
5. All authentication flows work
6. Dashboards show relevant data
7. Mobile responsive throughout
8. No critical bugs or console errors
