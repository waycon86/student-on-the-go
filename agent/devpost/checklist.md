---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. One assignment becomes dated study sessions around fixed commitments**
  Becomes usable: A student can enter estimated total work, choose study days and a time window, set a session length and deadline buffer, add fixed commitments, and see study sessions planned backward from the due date without overlap.
  Why now: This is the kernel of the app: protected obligations, deadline-aware planning, and a built-in warning when the plan no longer fits. It proves the app can handle the most urgent scheduling risk early.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior > Study Time and Session Length Configuration`, `prd.md > Features and Behavior > Fixed Commitment Protection`, `prd.md > Features and Behavior > Deadline-Driven Study Planning`, `prd.md > Features and Behavior > Missed-Session Recovery`
  Spec ref: `spec.md > Components`, `spec.md > Data Model`, `spec.md > How This Works, In Plain Language`, `spec.md > Important Failure Modes`
  Build: Add assignment work estimates, study-day/time-window configuration, deadline-buffer planning, fixed commitment protection, milestone ordering, session status tracking, unfinished-session rescheduling, work-estimate validation, and dark mode while keeping completed sessions and protected commitments intact.
  Verify (mechanical): Run `npx tsx src/lib/scheduler.test.ts`, `npx tsx src/lib/validation.test.ts`, and `npm run build` and confirm the scheduler rules, conversion logic, and app compile cleanly.
  Learner check: Open the app, set one assignment with hours and minutes, add protected commitments, toggle dark mode, try different session lengths and buffer values, then confirm the planner keeps study sessions outside fixed blocks and warns when the plan no longer fits.
  Commit: `Build first assignment scheduling flow`

## Hands-on Checkpoints

- [x] Early usable behavior explored — the first planning loop was validated against focused scheduling tests and a running build
- [x] Final kick-the-tires exploration and feedback completed — the planner flow was checked for overlap avoidance, deadline safety, and rescheduling behavior

## Final Review

- [x] Final review complete — the scheduler logic, planning inputs, and app build were verified and the project is ready for the next increment

## Code Tour and App Map

- [x] Learning activity complete — the scheduler logic was traced from the app settings through the scheduling engine and the evidence was verified with tests
- [x] Optional edit and transfer reflection addressed — the current project path and reusable planning pattern were identified without adding unnecessary scope
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: The first slice proves the core kernel: assignment due date + total work + study windows + fixed commitments => deadline-aware study sessions; verification covered overlap prevention, deadline buffer checks, and unfinished-session rescheduling logic.
Route and stops: `src/App.tsx`, `src/lib/scheduler.ts`, `src/lib/scheduler.test.ts`
Edit outcome: The app was updated in place and kept working; the scheduling engine was extracted to a dedicated module for clarity and testing.
Reflection: This project now has a reusable pattern for modeling assignment work, protected commitments, and rescheduling logic before any syllabus extraction or campus map work is added.
Activity mode: live app and editor with test verification

## Revisions

- The first planning slice was expanded from a basic sample scheduler into a full kernel workflow: total-work estimate, availability windows, buffer-aware backward planning, milestone ordering, status tracking, and rescheduling of unfinished sessions while keeping fixed commitments protected.
- The scheduling engine was extracted into `src/lib/scheduler.ts` and tested in `src/lib/scheduler.test.ts` so the scheduling rules are verified independently from the UI.
