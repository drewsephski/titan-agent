# Kickoff Prompt for Coding Agent - Task 5

Continue building the AI Workflow Template Marketplace. Start with Task 5.

## Current State

**Tasks Completed:** 4 of 13

- ✅ Task 1: Project initialized with dependencies
- ✅ Task 2: Database schema configured  
- ✅ Task 2.5: Workflow builder installed (@simple-ai/workflow-01)
- ✅ Task 3: Authentication with Better-auth
- ✅ Task 4: Template browsing and discovery

**Current Task:** Task 5 - Build template detail page

---

## Step 1: Read Project Files

Read these files in order:

1. `activity.md` - Current progress and context
2. `prd.md` - Find Task 3 requirements
3. `WORKFLOW_INTEGRATION.md` - How the workflow builder fits in
4. `PROMPT.md` - Development patterns and guidelines

---

## Step 2: Execute Task 5

**Task 5:** "Build template detail page"

### Sub-tasks

1. **Create template detail layout with tabs**
   - Update `/templates/[slug]/page.tsx` with full template detail view
   - Add tabs: Overview, Documentation, Reviews
   - Show template metadata (title, creator, rating, price)

2. **Build workflow preview section**
   - Use existing `WorkflowPreview` component (already created in Task 4)
   - Show full workflow graph in a larger view
   - Add zoom/pan controls for exploration

3. **Add documentation viewer**
   - Markdown rendering for template documentation
   - Syntax highlighting for code blocks
   - Collapsible sections if needed

4. **Implement reviews section**
   - Display reviews with ratings
   - Show verified purchase badges
   - Add pagination for many reviews

5. **Create purchase CTA section**
   - Price display with buy button
   - Integration requirements list
   - Certification badge display

---

## Step 3: Verify and Complete

Before marking complete:

- [ ] Template detail page loads with all tabs
- [ ] Workflow preview displays correctly
- [ ] Documentation renders markdown properly
- [ ] Reviews show with verified badges
- [ ] Purchase CTA visible
- [ ] No TypeScript errors
- [ ] Dev server runs without errors

---

## Step 4: Update Progress

Update `activity.md` with Task 5 completion entry.
Mark Task 5 as `"passes": true` in `prd.md`.

---

## Step 5: Continue to Task 6

Move to Task 6: "Implement template submission system"

---

## Key Implementation Details

### Template Detail Structure

```
/templates/[slug]
├── Header (title, creator, rating)
├── Workflow Preview (large React Flow view)
├── Tabs
│   ├── Overview (description, integrations, complexity)
│   ├── Documentation (markdown)
│   └── Reviews (list with ratings)
└── Sidebar (price, buy button, certification)
```

### API Route for Single Template

```typescript
// GET /api/templates/[slug]
// Returns full template with reviews
```

### Workflow Preview Size

Use larger preview (400-500px height) on detail page vs 200px on cards.

---

## Testing Checklist

1. Visit `/templates/customer-support-ai` - Detail page loads
2. Check all tabs switch correctly
3. Verify markdown documentation renders
4. Reviews section shows verified badges
5. Workflow preview is interactive (zoom/pan)
6. Mobile responsive layout works

---

## Next Task Preview (Task 6)

"Implement template submission system"

- Submission form for creators
- Workflow JSON upload
- Metadata editing
- Documentation editor

---

Start now. Read the files and begin Task 5.
