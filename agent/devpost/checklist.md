---
doc: checklist
status: draft
---

# Build Checklist

Build mode: learn

## Slices

- [ ] **1. One assignment becomes dated study sessions around fixed commitments**
  Becomes usable: A student can add one assignment with a due date, add protected commitments for the week, and immediately see study sessions scheduled around those blocks without overlap.
  Why now: This is the kernel of the app: a real assignment, real fixed obligations, and a deadline-aware plan. It proves the app can protect obligations and still produce usable study time early.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior > Fixed Commitment Protection`, `prd.md > Features and Behavior > Deadline-Driven Study Planning`
  Spec ref: `spec.md > Components`, `spec.md > Data Model`, `spec.md > How This Works, In Plain Language`
  Build: Scaffold the project and create the first end-to-end planner UI: assignment input, fixed-commitment entry, and a generated study-session list that avoids overlaps and is anchored to the due date.
  Verify (mechanical): Run the app locally, add an assignment, add commitments, and confirm the generated sessions stay outside those protected windows and are dated before the due date.
  Learner check: Open the app, add one assignment and sample commitments, then confirm the sessions look realistic and respect the blocking commitments.
  Commit: `Build first assignment scheduling flow`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — first scheduling flow tested in the running app
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: The first working slice proves the core planning loop: assignment due date + fixed commitments => dated study sessions.
Route and stops: `src/App.tsx`, `src/App.css`, `src/index.css`
Edit outcome: Not applicable yet; app is in its first working version.
Reflection: Offered/declined as needed.
Activity mode: live app and editor

## Revisions
