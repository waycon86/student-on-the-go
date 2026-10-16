---
doc: prd
status: approved
---

# Student on the Go — Product Requirements

A student planning tool that turns a syllabus and a real weekly schedule into a realistic, deadline-aware study plan. The app works backward from due dates, protects fixed commitments, and helps the student recover from missed sessions without moving classes, work shifts, or club meetings.

Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, and `scope.md > The POC Boundary`.

## The Core Journey
1. A student opens the app and uploads a syllabus file or pastes course details.
2. The app extracts assignment names and due dates using a lightweight parser or simple AI-assisted extraction, and the student confirms the details before any schedule is created.
3. The student chooses their study session length, such as 45 minutes, and marks their available study windows.
4. The student adds fixed commitments such as classes, work shifts, and club meetings.
5. The app works backward from each assignment deadline and builds a study plan that includes a buffer before the due date.
6. The student can split an assignment into milestones such as research, outline, draft, and revision, and edit them as needed.
7. The app keeps all study sessions from overlapping with fixed commitments.
8. If a study session is missed, the student can reschedule it into another available slot without disturbing fixed commitments.
9. The app clearly warns the student if there is not enough time remaining to finish the planned work before the deadline.

## Screens and Layout
The first version is a single-page planner with a simple layout:
- Left panel: syllabus intake, parser results, and assignment confirmation
- Center panel: student availability and fixed commitments
- Right panel: generated study plan, milestones, and reschedule tools

A header may include the project title, a save indicator, and a button to add fixed commitments.

## Look and Feel
The app should feel calm, structured, and practical. Visuals should support confidence and reduce stress: clear labels, visible deadlines, consistent blocks for fixed commitments versus flexible study time, and enough contrast to make conflict warnings obvious.

## Features and Behavior

### Syllabus Intake and Confirmation
The app allows the user to upload a syllabus file or paste text, then shows the extracted assignments and deadlines for confirmation before any scheduling happens.

- As a student, I want to trust the assignment data before building a plan so that the schedule is based on the right deadlines.
  - [ ] Acceptance criterion — the user can upload a syllabus or paste text into the app.
  - [ ] Acceptance criterion — the app displays extracted assignment names, dates, or deadline information.
  - [ ] Acceptance criterion — the user must confirm or edit the extracted data before the app schedules work.

### Study Time and Session Length Configuration
The student can define how long each study session lasts and when they are generally free to study.

- As a student, I want to choose my own study block size and available windows so that the schedule matches my real life.
  - [ ] Acceptance criterion — the user can set a study session length such as 45 minutes.
  - [ ] Acceptance criterion — the user can specify their available study periods for the week.

### Milestone-Based Assignment Planning
Assignments are broken into editable milestones so work is more manageable and deadline-aware.

- As a student, I want to divide assignments into milestones so that I can plan the work in realistic steps.
  - [ ] Acceptance criterion — each assignment can be broken into milestones such as research, outline, draft, and revision.
  - [ ] Acceptance criterion — each milestone can be edited, renamed, or removed.
  - [ ] Acceptance criterion — the study plan reflects the milestone sequence and due date.

### Fixed Commitment Protection
Classes, work hours, and club meetings remain fixed and never get moved by the planner.

- As a student, I want my non-negotiable commitments to stay fixed so that my planning is realistic.
  - [ ] Acceptance criterion — the user can add classes, work shifts, and club meetings to the plan.
  - [ ] Acceptance criterion — the app blocks those time slots from study-session overlap.

### Deadline-Driven Study Planning
The planner works backward from assignment deadlines using the student’s available time, selected session length, and a buffer before the due date.

- As a student, I want a realistic study schedule so that I can complete work before it is due without last-minute panic.
  - [ ] Acceptance criterion — the app builds study sessions based on the assignment deadline and open study windows.
  - [ ] Acceptance criterion — the planner accounts for a buffer before the due date.
  - [ ] Acceptance criterion — the app warns when the plan does not leave enough time to finish.

### Missed-Session Recovery
A missed study session can be rescheduled into another free time slot without moving fixed obligations.

- As a student, I want to recover from a missed study block so that a single missed session does not derail the deadline plan.
  - [ ] Acceptance criterion — a missed session can be reassigned to a different open slot.
  - [ ] Acceptance criterion — the reschedule logic does not move classes, work, or club meetings.

### Stretch Goal: Campus Context
If time remains, the app can show a single-campus map and walking-time estimates between locations.

- As a student, I want a rough campus travel estimate so I can plan realistic transitions between locations if needed.
  - [ ] Acceptance criterion — a minimal campus map displays a few key locations.
  - [ ] Acceptance criterion — walking-time estimates are shown between relevant points.

## States and Boundaries
- **Initial import** — the student adds or pastes syllabus content and sees extracted information.
- **Confirmation gate** — the extracted syllabus information must be reviewed and accepted before scheduling begins.
- **Availability setup** — the student chooses session length and available study windows.
- **Fixed commitments** — classes, work shifts, and club meetings are visible as protected blocks.
- **Planned schedule** — study sessions appear only in open slots and respect the deadline buffer.
- **Missed session** — a missed study block can be rescheduled without disturbing fixed commitments.
- **Stress warning** — the app highlights when the timeline does not leave enough time to complete work.
- **Stretch campus mode** — a campus map and walking-time reminders may appear only after the core planning flow is working.

## Product Decisions
- Human review of syllabus extraction — the app will not schedule from unconfirmed syllabus data.
- Deadline-first scheduling — planning is driven by the due date, not by a generic calendar grid.
- Fixed commitments stay fixed — a mismatch between the academic plan and the real schedule is resolved by rescheduling study time, not by moving classes or work.
- Demo-first scope — the version focuses on clear scheduling logic, not broad productivity complexity.
- Parser honesty — extraction may use a simple rule-based parser or lightweight AI assistance, but the app must explain limitations clearly and keep the final approval with the student.

## What We're Building
- syllabus upload or paste-in text
- extracted assignment review with confirmation requirement
- study session size and available-time configuration
- milestone-based assignment planning
- fixed commitment scheduling
- backward deadline planning with a buffer
- conflict avoidance and missed-session rescheduling
- clear warnings when the plan cannot fit
- optional single-campus walking-time feature as a stretch goal

## Deferred From the POC
- direct connections to LMS systems or email
- full multi-calendar sync
- account-based persistence or cloud sync
- semester-wide optimization across multiple courses
- campus departure reminders and route guidance beyond the stretch goal

## Possible Later Enhancements
- stronger parsing for PDFs and inconsistent syllabus formats
- recurring weekly templates for common coursework patterns
- smarter milestone suggestions based on assignment type
- campus route reminders and departure notices
- reminder notifications and progress tracking

## Non-Goals
- replacing a real academic planner or student calendar completely
- full optimization of every possible scheduling scenario
- automatic movement of mandatory obligations
- advanced route planning for multiple campuses or public transit networks

## Open Questions
- Should the initial demo use a simple rule-based parser rather than AI-assisted extraction to keep the logic transparent? This should be decided before build.
- Should the campus map remain a pure stretch goal until the core flow is validated and demo-ready? This can wait until the build phase.
