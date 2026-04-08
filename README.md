# Titan

Build and share AI workflows visually. Create agentic automations with drag-and-drop nodes, sell them in the marketplace, or run them in the playground.

![Titan](./public/og.png)

## Features

- **Visual Workflow Builder** - Drag-and-drop nodes for AI agents, webhooks, logic, and more
- **AI Chat Playground** - Test workflows with streaming responses and tool calling
- **Template Marketplace** - Buy and sell workflow templates
- **Authentication** - Social login with Google, GitHub, Discord

## Quick Start

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Fill in: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL

# Setup database
bun run db:migrate

# Run dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

- Next.js 15 + React + TypeScript
- Tailwind CSS + shadcn/ui
- Better Auth + PostgreSQL + Drizzle ORM
- Stripe for payments
