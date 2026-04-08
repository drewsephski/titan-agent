# QA Coding Agent Prompt

## Objective

Analyze the entire AI Workflow Template Marketplace codebase for logic errors, type safety issues, performance problems, security vulnerabilities, and production-readiness concerns. Fix all identified issues to ensure a robust, production-ready application.

## Context

This is a Next.js 15 application with:

- React Server Components and Client Components
- Better-auth for authentication
- Drizzle ORM with PostgreSQL
- Stripe for payments
- Resend for emails
- shadcn/ui components
- Vitest + Playwright for testing

All 13 MVP tasks have been completed. Now we need a thorough QA review before production deployment.

## Review Areas

### 1. Type Safety & Logic Errors

- [ ] Check all server actions for proper return types
- [ ] Verify database query types match schema
- [ ] Review async/await usage - no floating promises
- [ ] Check for potential null/undefined dereferences
- [ ] Review type assertions (avoid `as` where possible)
- [ ] Verify function signatures match implementations

### 2. Error Handling

- [ ] Ensure all async operations have try/catch
- [ ] Verify error messages are user-friendly
- [ ] Check error boundaries cover all routes
- [ ] Review fallback UI for error states
- [ ] Ensure server action errors are properly propagated
- [ ] Check logging for debugging (no sensitive data)

### 3. Database & Data Integrity

- [ ] Review Drizzle schema for proper constraints
- [ ] Check all foreign key relationships
- [ ] Verify transaction usage where needed
- [ ] Review migration files for correctness
- [ ] Check for potential race conditions
- [ ] Verify proper use of database indexes

### 4. Authentication & Security

- [ ] Verify all protected routes use proper auth checks
- [ ] Check role-based access control (admin/creator/buyer)
- [ ] Review API route authentication
- [ ] Verify CSRF protection where needed
- [ ] Check for SQL injection vulnerabilities
- [ ] Review XSS prevention in rendered content
- [ ] Verify proper sanitization of user input

### 5. Payment & Business Logic

- [ ] Review Stripe integration for edge cases
- [ ] Check webhook handling for idempotency
- [ ] Verify price calculations are correct
- [ ] Review purchase flow for race conditions
- [ ] Check license key generation logic
- [ ] Verify refund handling

### 6. Email & Notifications

- [ ] Check email sending for proper error handling
- [ ] Verify notification preferences are respected
- [ ] Review email template rendering
- [ ] Check for email sending loops/spam

### 7. Performance

- [ ] Review database query optimization
- [ ] Check for N+1 query problems
- [ ] Verify proper use of caching
- [ ] Review bundle size concerns
- [ ] Check for memory leaks

### 8. Testing

- [ ] Ensure all critical paths have unit tests
- [ ] Review test coverage gaps
- [ ] Check E2E tests cover main user flows
- [ ] Verify mock data is realistic

### 9. Documentation

- [ ] Check README is up to date
- [ ] Review environment variable documentation
- [ ] Verify API documentation accuracy
- [ ] Check code comments for clarity

## Process

1. **Start with TypeScript compilation**: Run `npx tsc --noEmit` and fix all errors
2. **Run all tests**: Execute `bun test --run` and fix failures
3. **Code review by area**: Go through each review area systematically
4. **Fix and verify**: Make fixes, then re-run tests and type check
5. **Document findings**: Note all issues found and fixes applied

## Key Files to Review

- `src/lib/actions/*.ts` - All server actions
- `src/app/api/**/*.ts` - API routes
- `src/lib/db/schema.ts` - Database schema
- `src/lib/email-service.ts` - Email logic
- `src/app/(dashboard)/**/page.tsx` - Dashboard pages
- `src/app/(marketing)/**/*.tsx` - Marketing pages

## Output Format

Provide a detailed report with:

1. **Issues Found**: Categorized by severity (Critical/High/Medium/Low)
2. **Fixes Applied**: What was changed and why
3. **Remaining Concerns**: Any issues requiring further attention
4. **Test Results**: Before and after test counts
5. **Recommendations**: Suggestions for future improvements

## Commands to Run

```bash
# Type check
npx tsc --noEmit --skipLibCheck

# Run unit tests
bun test --run

# Run linting
bun run lint

# Build check
bun run build
```

## Success Criteria

- [ ] Zero TypeScript errors
- [ ] All unit tests passing
- [ ] No critical or high severity issues remaining
- [ ] Build completes successfully
- [ ] Manual code review completed for all key files
