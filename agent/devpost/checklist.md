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

## Syllabus Intake Slice

- [x] **2. Import syllabus text and confirm assignments before scheduling**
  Becomes usable: A student can paste text or upload a .txt syllabus, review extracted assignments, fix missing dates, set work estimates in hours and minutes, and confirm only valid entries before they are added to the planner.
  Why now: Syllabus intake is the next critical step in the product journey: it turns fallback schedule assumptions into real assignment inputs without guessing at missing dates.
  PRD ref: `prd.md > Features and Behavior > Syllabus Intake and Confirmation`
  Spec ref: `spec.md > Syllabus Intake`, `spec.md > Data Model`
  Build: Add pasted-text and .txt upload handling, assignment extraction, per-item review fields, duplicate prevention, date validation, explicit confirmation gate, and a two-assignment planning view that shares available study time without overlapping fixed commitments.
  Verify (mechanical): Run `npx tsx src/lib/syllabus.test.ts`, `npx tsx src/lib/scheduler.test.ts`, and `npm run build` and confirm extraction, duplicate prevention, multi-assignment scheduling, and the app build all work.
  Learner check: Paste sample assignment lines or upload a .txt file, review the extracted list, correct any date or estimate issues, confirm one or more assignments, and confirm the planner can schedule more than one assignment without overlapping itself or fixed commitments.
  Commit: `Add syllabus intake and confirmation flow`

## Hands-on Checkpoints

- [x] Early usable behavior explored — the first planning loop was validated against focused scheduling tests and a running build
- [x] Final kick-the-tires exploration and feedback completed — the planner flow was checked for overlap avoidance, deadline safety, and rescheduling behavior
- [x] Early usable behavior explored — the syllabus intake flow was checked for extraction, review, duplicate prevention, and confirmation behavior
- [x] Final kick-the-tires exploration and feedback completed — two assignments were scheduled together while preserving fixed commitments and shared study windows

## Final Review

- [x] Final review complete — the scheduler logic, planning inputs, and app build were verified and the project is ready for the next increment
- [x] Final review complete — syllabus intake and confirmation were verified and the app remains ready for the next stretch goal, which is campus context only after the core flow is proven

## Code Tour and App Map

- [x] Learning activity complete — the scheduler logic was traced from the app settings through the scheduling engine and the evidence was verified with tests
- [x] Optional edit and transfer reflection addressed — the current project path and reusable planning pattern were identified without adding unnecessary scope
- [x] Learning activity complete — the intake flow was traced from pasted text to confirmed assignment list and then into the multi-assignment planner
- [x] Optional edit and transfer reflection addressed — the extracted assignment pattern kept the core scheduling engine intact and avoided overbuilding beyond the approved scope
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: The first slice proves the core kernel: assignment due date + total work + study windows + fixed commitments => deadline-aware study sessions; verification covered overlap prevention, deadline buffer checks, and unfinished-session rescheduling logic.
Route and stops: `src/App.tsx`, `src/lib/scheduler.ts`, `src/lib/scheduler.test.ts`
Edit outcome: The app was updated in place and kept working; the scheduling engine was extracted to a dedicated module for clarity and testing.
Reflection: This project now has a reusable pattern for modeling assignment work, protected commitments, and rescheduling logic before any syllabus extraction or campus map work is added.
Activity mode: live app and editor with test verification

## Revisions

- The first planning slice was expanded from a basic sample scheduler into a full kernel workflow: total-work estimate, availability windows, buffer-aware backward planning, milestone ordering, status tracking, and rescheduling of unfinished sessions while keeping fixed commitments protected.
- The scheduling engine was extracted into `src/lib/scheduler.ts` and tested in `src/lib/scheduler.test.ts` so the scheduling rules are verified independently from the UI.
- Syllabus intake was added as a lightweight reviewable flow: paste text or upload .txt, inspect extracted entries, correct missing dates, set work estimates, confirm only valid items, and prevent duplicates from re-importing.
- The planner was verified against a multi-assignment scenario to ensure multiple confirmed assignments share study availability without overlapping protected commitments.

## School Theme Slice

- [x] **3. Apply a university brand theme and preserve it across refreshes**
  Becomes usable: A student can choose a school theme from 25 university presets, see the selected colors update immediately across the app, and keep that preference when the page reloads.
  Why now: Personalization is part of the product experience. The planner is already useful without it, but a school-branded theme makes the experience feel native to the student while preserving accessibility and readability.
  PRD ref: `prd.md > Materials and Visual Identity`, `prd.md > Product Experience`, `prd.md > Continuity and Persistence`
  Spec ref: `spec.md > Visual Design`, `spec.md > Theming`, `spec.md > Data Persistence`
  Build: Centralize the university palette in `src/lib/schoolThemes.ts`, map them to CSS custom properties in the app shell, add a labeled dropdown under Appearance on the My Schedule page, keep the default set to Michigan State, save the selection to `localStorage`, and preserve readable contrast with supporting shades for text and UI surfaces.
  Verify (mechanical): Run `npm run build` and confirm the theme config resolves to 25 presets with the default `michigan-state` theme.
  Learner check: Open the My Schedule page, change the school selector, confirm the app updates immediately, refresh the page, and verify the same theme is preserved.
  Commit: `Add shared school theme selector and persistence`
