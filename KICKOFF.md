# Kickoff Prompt for Coding Agent

Start building the AI Workflow Template Marketplace. Follow this sequence:

## Step 1: Read the Project Files

Read these files in order:

1. `activity.md` - Current project state
2. `prd.md` - Product requirements document
3. `PROMPT.md` - Development guidelines and patterns

## Step 2: Start with Task 1

Find the first task with `"passes": false` in `prd.md`. It should be:

**Task 1:** "Initialize Next.js project with shadcn/ui and configure base dependencies"

## Step 3: Execute the Task

Complete all steps in Task 1:

1. The project is already scaffolded (Titan template), verify it's working
2. Install additional dependencies: stripe, resend, uploadthing, @uploadthing/react
3. Verify shadcn/ui components are configured
4. Set up project structure (folders for templates, creator, admin)

## Step 4: Verify and Complete

- [ ] No TypeScript errors
- [ ] Project structure matches PRD architecture

## Step 5: Update Progress

Update `activity.md` with completion entry and mark Task 1 as `"passes": true` in `prd.md`.

## Step 6: Continue to Next Task

Move to Task 2 and repeat the process.

---

## Key Reminders

- **Use the existing Titan base** — Don't create a new project, extend what's here
- **Better-auth is already configured** — Just verify it's working
- **Drizzle ORM is set up** — Extend the schema in `src/lib/db/schema.ts`
- **Follow PROMPT.md patterns** — Server Actions for mutations, API routes for webhooks
- **Test in browser** — Verify each feature works before marking complete

## External Services (Phase 2)

Don't worry about these for initial setup:

- Stripe account setup
- Resend configuration  
- UploadThing tokens
- OAuth app creation

These will be configured when you reach the integration tasks.

---

## Questions?

If stuck on anything:

1. Check PROMPT.md "Common Issues & Solutions" section
2. Refer to the shadcn/ui docs: <https://ui.shadcn.com>
3. Check simple-ai docs for workflow JSON format: <https://www.simple-ai.dev/docs>

Start now. Read the files and begin Task 1.
