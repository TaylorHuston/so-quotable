---
issue_id: TASK-008
plan_type: task
created: 2025-11-23
last_updated: 2025-11-23
complexity: 7.5
status: planned
---

# Implementation Plan: TASK-008 - Establish UI Design System and Component Library

## Overview

Create a production-ready design system and component library that serves as the foundation for SPEC-002 UI development (admin dashboard + quote generation). This plan takes a **pragmatic, test-first approach** focused on the specific components needed for our MVP, not a comprehensive multi-app design system.

**Strategic Approach**:
1. **Design tokens first** - Establish WCAG AA compliant color system, typography scale, and spacing tokens
2. **Accessible primitives** - Leverage Radix UI for ARIA-compliant base components
3. **Compose upward** - Build specific components (Button, Form, Card, Modal) on Radix foundations
4. **Test accessibility** - axe-core automated testing + manual keyboard/screen reader validation
5. **Document everything** - Component usage examples and accessibility guidelines

**Comparison to Similar Tasks**:
- Like TASK-003 (Cloudinary): External service integration (Radix UI) with comprehensive testing
- Like TASK-005 (E2E Testing): Infrastructure task establishing patterns for future feature work
- Unlike TASK-004 (Auth): More frontend-focused, less backend complexity
- Estimated 10-14 hours vs TASK-003's 7-11 hours (UI work requires more iteration/validation)

**Key Design Decisions**:
1. **Radix UI over Headless UI** - Better TypeScript support, smaller bundle size, more accessible primitives
2. **CSS Variables + Tailwind** - Design tokens as CSS vars, Tailwind utility classes for composition
3. **No Storybook** - Deferred to post-MVP, use example pages instead
4. **Desktop-first** - Primary target 1920x1080, tablet 1024x768, mobile deferred
5. **Light mode only** - Dark mode deferred to post-MVP

## Phases

### Phase 1 - Design Token System & WCAG Compliance

**Goal**: Establish accessible color palette, typography scale, and spacing system following WCAG 2.1 AA standards.

- [ ] 1.1 Research WCAG 2.1 AA contrast requirements
  - [ ] 1.1.1 Document contrast ratios (4.5:1 normal text, 3:1 large text/UI)
  - [ ] 1.1.2 Research color contrast validation tools (WebAIM, accessible-colors.com)
  - [ ] 1.1.3 Review existing globals.css for baseline tokens

- [ ] 1.2 Define color palette with contrast validation
  - [ ] 1.2.1 Write tests for contrast ratio calculations
  - [ ] 1.2.2 Define primary/secondary/semantic colors with WCAG AA compliance
  - [ ] 1.2.3 Create color token tests (contrast, readability, consistency)
  - [ ] 1.2.4 Implement color system as CSS variables in globals.css

- [ ] 1.3 Define typography scale and spacing system
  - [ ] 1.3.1 Write tests for typography scale (16px base, 1.25 ratio - Major Third)
  - [ ] 1.3.2 Define font families, sizes, weights, line heights
  - [ ] 1.3.3 Create spacing scale tests (8px base unit multiples)
  - [ ] 1.3.4 Implement typography and spacing as CSS variables

- [ ] 1.4 Define border radius, shadows, transitions
  - [ ] 1.4.1 Write tests for border radius scale (0, 4px, 8px, 12px, 16px, full)
  - [ ] 1.4.2 Define shadow scale (sm, md, lg, xl) with subtle elevations
  - [ ] 1.4.3 Define transition durations (200ms default, 150ms fast, 300ms slow)
  - [ ] 1.4.4 Implement as CSS variables

**Test Strategy**: Unit tests for token calculations, visual regression testing deferred to post-MVP

**Estimated Time**: 3-4 hours

---

### Phase 2 - Radix UI Integration & Base Components

**Goal**: Install Radix UI primitives and create foundational accessible components (Button, Form inputs, Focus management).

- [ ] 2.1 Install and configure Radix UI primitives
  - [ ] 2.1.1 Research Radix UI packages needed (@radix-ui/react-dialog, react-form, react-label)
  - [ ] 2.1.2 Install Radix dependencies (@radix-ui/react-*)
  - [ ] 2.1.3 Create Radix integration test (verify primitives work with Next.js 16)
  - [ ] 2.1.4 Document Radix usage patterns in component library

- [ ] 2.2 Create Button component with ARIA support
  - [ ] 2.2.1 Write Button tests (variants, states, keyboard nav, screen reader labels)
  - [ ] 2.2.2 Implement Button component (primary, secondary, danger variants)
  - [ ] 2.2.3 Add focus states (2px solid outline, 2px offset)
  - [ ] 2.2.4 Add loading and disabled states with aria-busy, aria-disabled

- [ ] 2.3 Create Form input components with labels
  - [ ] 2.3.1 Write Input tests (text, email, password, required, validation, labels)
  - [ ] 2.3.2 Implement Input component with Radix Label primitive
  - [ ] 2.3.3 Write Textarea tests (multiline, char count, resize behavior)
  - [ ] 2.3.4 Implement Textarea component
  - [ ] 2.3.5 Write Select tests (keyboard nav, screen reader, options)
  - [ ] 2.3.6 Implement Select component using Radix Select primitive

- [ ] 2.4 Create file upload component
  - [ ] 2.4.1 Write FileUpload tests (drag-drop, file validation, preview, accessibility)
  - [ ] 2.4.2 Implement FileUpload component (for Cloudinary integration in TASK-009)
  - [ ] 2.4.3 Add aria-label, file type validation, size limits

**Test Strategy**:
- Unit tests with @testing-library/react (user interaction, keyboard nav)
- axe-core automated accessibility testing for each component
- Manual keyboard navigation testing (Tab, Enter, Space, Escape)

**Estimated Time**: 4-5 hours

---

### Phase 3 - Layout Components & Navigation

**Goal**: Create Card, Modal, and Navigation components with WCAG keyboard navigation and ARIA landmarks.

- [ ] 3.1 Create Card component for content display
  - [ ] 3.1.1 Write Card tests (header, body, footer, semantic HTML)
  - [ ] 3.1.2 Implement Card component (for person/photo/quote display in TASK-010)
  - [ ] 3.1.3 Add proper heading hierarchy (<h2>, <h3> nested correctly)
  - [ ] 3.1.4 Test with screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)

- [ ] 3.2 Create Modal/Dialog component with focus trap
  - [ ] 3.2.1 Write Modal tests (open, close, focus trap, Escape key, backdrop click)
  - [ ] 3.2.2 Implement Modal using Radix Dialog primitive
  - [ ] 3.2.3 Add focus management (auto-focus first element, return focus on close)
  - [ ] 3.2.4 Add keyboard navigation (Escape closes, Tab cycles within modal)
  - [ ] 3.2.5 Test with screen reader (modal announced, content readable)

- [ ] 3.3 Create Navigation component with ARIA landmarks
  - [ ] 3.3.1 Write Navigation tests (keyboard nav, ARIA roles, current page indicator)
  - [ ] 3.3.2 Implement Navigation component (for admin dashboard sidebar in TASK-009)
  - [ ] 3.3.3 Add ARIA landmarks (<nav>, aria-current, aria-label)
  - [ ] 3.3.4 Add keyboard navigation (Tab, arrow keys for vertical nav)
  - [ ] 3.3.5 Test with screen reader (nav announced, links readable, current page indicated)

- [ ] 3.4 Create Data Table component with keyboard navigation
  - [ ] 3.4.1 Write Table tests (sortable headers, keyboard nav, row selection, screen reader)
  - [ ] 3.4.2 Implement Table component (for admin CRUD lists in TASK-009)
  - [ ] 3.4.3 Add sortable headers (aria-sort, keyboard activation)
  - [ ] 3.4.4 Add keyboard navigation (arrow keys for cell-to-cell, Enter for row actions)
  - [ ] 3.4.5 Test with screen reader (table structure announced, headers associated with cells)

**Test Strategy**:
- Unit tests for component behavior and state
- axe-core for automated ARIA validation
- Manual keyboard testing (Tab, Shift+Tab, Enter, Space, Escape, Arrow keys)
- Manual screen reader testing (NVDA/JAWS/VoiceOver)

**Estimated Time**: 4-5 hours

---

### Phase 4 - Page Layouts & Accessibility Testing Infrastructure

**Goal**: Create reusable page layout patterns and establish comprehensive accessibility testing infrastructure.

- [ ] 4.1 Create page layout components
  - [ ] 4.1.1 Write AdminLayout tests (sidebar, content area, responsive, ARIA landmarks)
  - [ ] 4.1.2 Implement AdminLayout (for TASK-009 admin dashboard)
  - [ ] 4.1.3 Write UserLayout tests (header, main, footer, skip links)
  - [ ] 4.1.4 Implement UserLayout (for TASK-010 quote generation)
  - [ ] 4.1.5 Add skip-to-content links for keyboard navigation

- [ ] 4.2 Set up axe-core accessibility testing infrastructure
  - [ ] 4.2.1 Install @axe-core/react and vitest-axe
  - [ ] 4.2.2 Create axe test helper (axeTest() function for all components)
  - [ ] 4.2.3 Add axe tests to all components (Button, Input, Card, Modal, Navigation, Table)
  - [ ] 4.2.4 Configure CI to fail on critical accessibility violations

- [ ] 4.3 Manual accessibility validation
  - [ ] 4.3.1 Keyboard navigation testing checklist (all components, all interactions)
  - [ ] 4.3.2 Screen reader testing (NVDA on Windows, VoiceOver on Mac)
  - [ ] 4.3.3 Document keyboard shortcuts and screen reader behaviors
  - [ ] 4.3.4 Create accessibility testing guide for developers

- [ ] 4.4 Component documentation
  - [ ] 4.4.1 Create component usage examples (code snippets for each component)
  - [ ] 4.4.2 Document accessibility patterns (ARIA, keyboard nav, focus management)
  - [ ] 4.4.3 Create design token reference (colors, typography, spacing)
  - [ ] 4.4.4 Document responsive breakpoints and layout patterns

**Test Strategy**:
- Automated: axe-core on every component render
- Manual: Complete keyboard navigation pass
- Manual: Screen reader testing on NVDA/VoiceOver
- Documentation: Code examples with accessibility notes

**Estimated Time**: 3-4 hours

---

## Scenario Coverage

**SPEC-002 Scenario 6: Admin dashboard WCAG compliance**

> Given: Admin navigates to admin dashboard
> When: Admin uses keyboard-only navigation
> Then: All CRUD operations are accessible via keyboard
> And: Screen reader announces all form labels and actions
> And: Color contrast meets WCAG 2.1 AA standards
> And: Focus indicators are clearly visible

**Coverage by Phase**:

✅ **Phase 1** validates WCAG 2.1 AA compliance:
- Phase 1.2: Color contrast ratios tested (4.5:1 normal, 3:1 large text)
- Phase 1.3: Typography legibility and readability
- Phase 1.4: Focus indicators (2px solid outline, 2px offset)

✅ **Phase 2** validates keyboard navigation and ARIA:
- Phase 2.2: Button keyboard activation (Enter, Space)
- Phase 2.3: Form input keyboard navigation (Tab, Shift+Tab)
- Phase 2.3: Form labels with aria-label and aria-describedby

✅ **Phase 3** validates complex component accessibility:
- Phase 3.2: Modal focus trap and keyboard escape
- Phase 3.3: Navigation ARIA landmarks and keyboard nav
- Phase 3.4: Table keyboard navigation (arrow keys, Enter)

✅ **Phase 4** validates complete WCAG compliance:
- Phase 4.2: axe-core automated testing (all components)
- Phase 4.3: Manual keyboard navigation testing
- Phase 4.3: Screen reader testing (NVDA/JAWS/VoiceOver)

**Other SPEC-002 Scenarios**:

Other scenarios (1-5) are feature-specific and will be validated in TASK-009 (admin dashboard) and TASK-010 (quote generation) using the components established here. This task provides the **foundation** for those features.

---

## Implementation Philosophy

**STRATEGIC, NOT TACTICAL:**
- This plan describes **WHAT** to build, not **HOW** to build it
- Specialist agents (frontend-specialist, ui-ux-designer) decide implementation details
- Agents leverage WORKLOG to understand what's been done and lessons learned
- Agents adapt to current codebase state, not rigid prescriptive steps

**LIVING DOCUMENT:**
- Plans evolve as implementation progresses
- Update when discoveries in one phase affect later phases
- Reference WORKLOG for context on why decisions were made
- Adjust scope/phases based on complexity revelations

**Examples:**
- ✅ STRATEGIC: "Create accessible Button component with primary/secondary/danger variants and WCAG focus states"
- ❌ TACTICAL: "Create Button.tsx with interface ButtonProps { variant: 'primary' | 'secondary'; onClick: () => void; } at line 42"

---

## Mandatory Phase Execution

Each phase MUST follow the mandatory test-first loop (see [pm-guide.md](../../docs/development/workflows/pm-guide.md)):

1. **Write Tests** (Red) - Tests written and initially failing
2. **Write Code** (Green) - Implementation makes tests pass
3. **Code Review** (≥90) - Quality gate validation
4. **Commit** - Tested, reviewed code committed
5. **WORKLOG** - Document what was done and lessons learned
6. **Next Phase** - Proceed only after all quality gates pass

**No shortcuts**: Tests cannot be skipped, code review cannot be skipped, phases cannot be combined.

---

**Note**: Phases are suggestions. Modify to fit your workflow!

**Alternative Patterns**:
- **Strict TDD**: Red-Green-Refactor cycle visible in every step
- **BDD Scenarios**: Define Given/When/Then → Implement tests → Build features
- **Test Pyramid**: Heavy unit, moderate integration, light E2E
- **Pragmatic**: Spike/explore → Write tests → Implement production code

---

## Complexity Analysis

**Score**: 7.5/10 (High - but appropriately scoped for single task)

**Complexity Indicators**:

1. **File Count**: 15-20 new files
   - 10-12 component files (Button.tsx, Input.tsx, Card.tsx, Modal.tsx, etc.)
   - 10-12 test files (.test.tsx for each component)
   - 1 globals.css update (design tokens)
   - 1 axe test helper
   - 1 accessibility testing guide (docs/)

2. **Dependencies**: 8-10 new packages
   - @radix-ui/react-dialog
   - @radix-ui/react-label
   - @radix-ui/react-select
   - @radix-ui/react-accessible-icon
   - @axe-core/react
   - vitest-axe
   - (Possibly more Radix primitives as needed)

3. **Test Complexity**: HIGH
   - Unit tests: 60-80 tests (5-7 per component)
   - Accessibility tests: 10-12 axe tests (1 per component)
   - Manual tests: Keyboard navigation + screen reader validation
   - Coverage target: 95%+ (matching TASK-003 and TASK-005)

4. **External Integrations**: 1 (Radix UI primitives)
   - Well-documented library with TypeScript support
   - Lower risk than custom implementation

5. **Performance Requirements**: Low
   - Design tokens are CSS variables (no runtime cost)
   - Radix primitives are lightweight (<10KB each)
   - No heavy animations or transitions in MVP

6. **Security Requirements**: Low
   - UI components don't handle sensitive data directly
   - ARIA attributes don't expose security concerns
   - XSS prevention via React's built-in escaping

7. **Accessibility Requirements**: CRITICAL
   - WCAG 2.1 AA compliance mandatory
   - Keyboard navigation for 100% of interactions
   - Screen reader compatibility required
   - This is the PRIMARY complexity driver

**Decomposition Recommendation**:

**DO NOT DECOMPOSE**. While complexity is 7.5/10, this task is appropriately scoped because:

1. **Natural Cohesion**: Design tokens, components, and accessibility testing are tightly coupled
2. **Foundation Work**: Splitting would create artificial dependencies (can't test components without tokens)
3. **Clear Phases**: 4 phases provide natural breakpoints for progress tracking
4. **Comparison to Completed Work**: TASK-003 (complexity 9.5) was successfully completed in one task
5. **Estimated Hours**: 10-14 hours is within reasonable task size (1-3 days)

**Alternative**: If timeline pressure emerges, Phase 4.4 (documentation) could be completed asynchronously without blocking TASK-009/010 implementation.

---

## Implementation Notes

### Architectural Decisions

**ADR-001 Compliance**: Next.js 16 + TypeScript + Tailwind CSS
- Design tokens implemented as CSS variables in globals.css
- Tailwind utility classes for component composition
- TypeScript for component props and type safety

**Component Library Choice**: Radix UI over Headless UI
- **Better TypeScript support**: Radix has excellent TS inference
- **Smaller bundle size**: 3-8KB per primitive vs 10-15KB for Headless UI
- **More ARIA primitives**: Dialog, Label, Select with built-in accessibility
- **Active maintenance**: Regular updates, strong community

**Testing Strategy**: Test-First with Pragmatic Manual Validation
- Write unit tests FIRST for component behavior (Red-Green-Refactor)
- Add axe-core tests for automated ARIA validation
- Manual keyboard navigation testing (cannot be fully automated)
- Manual screen reader testing (NVDA/JAWS/VoiceOver - once per component)

### Design Token Strategy

**CSS Variables + Tailwind**: Hybrid approach
- CSS variables in globals.css for design tokens (colors, typography, spacing)
- Tailwind utility classes reference CSS variables (e.g., `bg-[var(--primary)]`)
- Enables runtime theme changes (post-MVP dark mode support)
- Avoids Tailwind config bloat (tokens in one place)

**WCAG AA Contrast Validation**: Automated testing
- Vitest tests for contrast ratios using contrast calculation library
- Target: 4.5:1 for normal text (<18pt), 3:1 for large text (≥18pt)
- Tools: polished (npm package for color manipulation), WebAIM Contrast Checker

### Lessons from Similar Tasks

**From TASK-003 (Cloudinary)**:
- ✅ Test-first approach achieves 90%+ coverage (we achieved 100% for pure functions)
- ✅ Comprehensive verification scripts catch edge cases early
- ✅ Manual verification essential for visual/interactive quality
- Apply: Write comprehensive unit tests, add manual accessibility checklist

**From TASK-005 (E2E Testing)**:
- ✅ Infrastructure tasks establish patterns for future work
- ✅ Code review scores ≥90 ensure production quality
- ✅ Documentation crucial for developer adoption
- Apply: Document component usage examples, create accessibility guide

**From TASK-004 (Auth)**:
- ⚠️ E2E tests revealed auth redirect gap (incomplete acceptance criteria)
- ⚠️ TDD found UX issues that would've been missed
- Apply: Test keyboard navigation thoroughly, validate screen reader announcements

### Component Scope (What's In vs Out)

**In Scope** (for SPEC-002):
- Button (primary, secondary, danger)
- Form inputs (text, email, password, textarea, select, file upload)
- Card (person/photo/quote display)
- Modal/Dialog (CRUD forms, confirmations)
- Navigation (admin sidebar, header)
- Data table (admin CRUD lists)
- Page layouts (AdminLayout, UserLayout)

**Out of Scope** (deferred to future):
- Accordion, Tabs, Tooltip, Popover (no SPEC-002 requirements)
- Date picker, color picker (not needed for MVP)
- Chart components (no data visualization in SPEC-002)
- Drag-and-drop (quote positioning deferred to post-MVP)
- Toast notifications (nice-to-have, not critical)

### Radix Primitives Needed

Based on SPEC-002 requirements:

1. **@radix-ui/react-dialog** - Modal/Dialog component (CRUD forms)
2. **@radix-ui/react-label** - Form input labels (accessibility)
3. **@radix-ui/react-select** - Dropdown select (person/photo/quote selectors)
4. **@radix-ui/react-accessible-icon** - Icon components (if needed)
5. **@radix-ui/react-visually-hidden** - Skip links, screen reader text

Research during Phase 2.1 will confirm exact packages needed.

### Accessibility Testing Tools

**Automated**:
- **@axe-core/react** - Automated ARIA validation in tests
- **vitest-axe** - Vitest integration for axe-core
- **eslint-plugin-jsx-a11y** - Linting for accessibility issues (already in Next.js)

**Manual**:
- **NVDA** (Windows) - Free, open-source screen reader
- **JAWS** (Windows) - Industry standard (if available)
- **VoiceOver** (Mac) - Built-in macOS screen reader
- **Keyboard testing** - Tab, Shift+Tab, Enter, Space, Escape, Arrow keys

### Responsive Breakpoints (Desktop-First)

Per SPEC-002 Definition of Done: "Desktop primary, tablet secondary, mobile deferred"

**Target Resolutions**:
- **Desktop**: 1920x1080 (primary development target)
- **Tablet**: 1024x768 (secondary - should be functional)
- **Mobile**: <768px (deferred to post-MVP)

**Tailwind Breakpoints**:
- `lg`: 1024px+ (desktop)
- `md`: 768px (tablet)
- `sm`: 640px (deferred - no mobile testing required)

### Post-MVP Enhancements

Documented in PLAN.md but deferred to future tasks:

1. **Storybook integration** - Component documentation and visual testing
2. **Dark mode support** - Already using CSS variables, easy to add
3. **Animation library** - Framer Motion for transitions
4. **Advanced components** - Tooltip, Popover, Accordion, Tabs
5. **Component variants** - Size variants (sm, md, lg), additional colors
6. **Visual regression testing** - Chromatic or Percy for screenshot diffing

### Quality Gates (Mandatory)

Per development-loop.md test-first loop:

1. ✅ **Tests written and initially failing** (Red)
2. ✅ **Tests passing after implementation** (Green)
3. ✅ **Code review score ≥90** (code-reviewer agent)
4. ✅ **Coverage ≥95%** (matching TASK-003 and TASK-005)
5. ✅ **axe-core tests passing** (zero critical violations)
6. ✅ **Manual keyboard navigation validated**
7. ✅ **Screen reader testing completed** (NVDA or VoiceOver)

Only then: Commit phase changes, update WORKLOG, proceed to next phase.

### Critical Gotchas (Anticipated)

1. **Radix CSS-in-JS**: Some Radix primitives expect CSS-in-JS - we're using Tailwind
   - Solution: Use Radix's unstyled primitives, apply Tailwind classes
   - Research during Phase 2.1 will validate approach

2. **Focus Trap Library**: Radix Dialog includes focus trap, but manual implementation needed for custom modals
   - Solution: Use Radix Dialog primitive, don't re-implement

3. **Screen Reader Testing Complexity**: Different screen readers announce differently
   - NVDA (Windows): Free, most common
   - JAWS (Windows): Industry standard, paid
   - VoiceOver (Mac): Built-in, different announcement patterns
   - Solution: Test with at least one (NVDA or VoiceOver), document differences

4. **Tailwind v4 CSS Variables**: New @theme inline syntax differs from v3
   - Existing globals.css already uses @theme inline
   - Follow existing pattern, extend with design tokens

5. **axe-core False Positives**: Some ARIA patterns trigger false positives
   - Solution: Document exceptions, use aria-* overrides when necessary
   - Always validate with manual testing

### WORKLOG Integration

Per pm-guide.md: "Agents read WORKLOG before each phase to understand context"

**Expected WORKLOG entries**:
- Phase 1: Color contrast validation challenges, WCAG AA resources
- Phase 2: Radix integration gotchas, Button implementation patterns
- Phase 3: Modal focus trap lessons, Table keyboard navigation edge cases
- Phase 4: Screen reader testing discoveries, accessibility guide learnings

Each phase MUST document:
1. What was done (implementation summary)
2. Decisions made (why certain approaches were chosen)
3. Lessons learned (gotchas, best practices discovered)
4. Critical gotchas (things that surprised us or caused issues)

---

## Estimated Timeline

**Total**: 10-14 hours (1.5-2 days of focused work)

**Breakdown**:
- Phase 1 (Design Tokens): 3-4 hours
- Phase 2 (Base Components): 4-5 hours
- Phase 3 (Layout Components): 4-5 hours
- Phase 4 (Layouts & Testing): 3-4 hours

**Confidence**: Medium-High (75%)

**Risks**:
- Radix integration complexity: +2 hours if CSS-in-JS conflicts
- Accessibility testing: +2 hours if screen reader issues emerge
- Scope creep: +2 hours if component variants proliferate

**Mitigation**:
- Timebox Radix research (Phase 2.1) to 1 hour max
- Limit component variants to MVP needs (no "nice-to-haves")
- Defer Storybook, advanced components, and documentation polish to post-MVP

---

## Next Steps

1. **Architectural Review**: Submit PLAN.md to code-architect for validation
2. **Security Review**: Submit to security-auditor (low priority - UI components, no sensitive data)
3. **Begin Phase 1**: Once reviews complete, start design token implementation
4. **Follow Test-First Loop**: Every phase follows Red-Green-Refactor-Review-Commit-WORKLOG

**Command**: `/implement TASK-008 1.1` (after architectural review approval)

---

**Plan Status**: Ready for architectural review

**Last Updated**: 2025-11-23

**Next Review**: After Phase 1 completion (adjust Phases 2-4 based on discoveries)
