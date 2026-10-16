---
doc: spec
status: approved
---

# Student on the Go — Technical Spec

## How This Works, In Plain Language
This is a small browser-based planner for a student. The flow starts with a syllabus upload or pasted course text. The app extracts assignments and deadlines, but the student must confirm the results before the planner uses them. The student then defines their available study times and preferred session length, adds fixed commitments such as classes or work shifts, and the app creates a schedule that works backward from the assignment deadline.

The key rule is that fixed commitments are protected. Classes, work shifts, and club meetings are treated as non-negotiable blocks. Study sessions are scheduled only in free time, and a missed session can be moved to another open slot without disturbing the fixed calendar. If there is not enough time left to finish a task realistically, the app tells the student clearly instead of pretending the plan is workable.

The first version is intentionally local and lightweight. It is meant to prove the scheduling idea in a demo, not become a full academic platform or a full calendar system.

## The Core Journey Through the System
The user uploads or pastes syllabus content → the app extracts assignment details → the student confirms or edits the deadlines → the student chooses a session-length and available study windows → the student adds fixed commitments → the scheduler works backward from deadlines and adds a buffer before due dates → the student can split work into milestones → missed study sessions are rescheduled into available time → the app warns the user if there is not enough time left.

PRD ref: `prd.md > The Core Journey`.

## Stack
Recommended stack for the demo:
- React + Vite + TypeScript
- CSS or lightweight component styling
- Local storage for a browser-only prototype
- Simple date utilities or a minimal scheduling helper library if needed

Rationale:
- A browser app is the fastest way to demonstrate real scheduling logic in a short build window.
- TypeScript helps keep assignment, milestone, and commitment data structured and easier to validate.
- Local storage is sufficient for a demo and avoids unnecessary backend complexity.

Documentation links:
- React: https://react.dev/
- Vite: https://vite.dev/
- TypeScript: https://www.typescriptlang.org/

## Where It Runs and How Someone Tries It
Runtime: local web app in the browser.
Environment: any modern browser with Node.js installed for development.
Start commands:
1. `npm install`
2. `npm run dev`
3. Open the locally served URL to use the planner.

This is enough for a short demo video and a public GitHub repository. Deployment is optional and not required for the hackathon submission.

## Look and Feel
The interface should feel organized, calm, and supportive. Use clear labels, a visual separation between fixed commitments and study blocks, and strong deadline cues. The colors should stay simple and academic rather than playful or overloaded. The planner should make conflicts and warnings obvious at a glance.

## Components

### Syllabus Intake
Accepts pasted text or a file upload and shows the extracted assignment information.
PRD ref: `prd.md > Features and Behavior > Syllabus Intake and Confirmation`.

### Assignment Confirmation Panel
Lets the student review, edit, or reject extracted assignments and deadlines before scheduling begins.
PRD ref: `prd.md > Features and Behavior > Syllabus Intake and Confirmation`.

### Availability and Session Configuration
Collects the student’s preferred study session length and available time windows.
PRD ref: `prd.md > Features and Behavior > Study Time and Session Length Configuration`.

### Fixed Commitment Planner
Stores classes, work shifts, and club meetings as protected blocks that cannot be moved.
PRD ref: `prd.md > Features and Behavior > Fixed Commitment Protection`.

### Study Planner
Builds a deadline-aware study plan from open time windows, study length, and a buffer before due dates.
PRD ref: `prd.md > Features and Behavior > Deadline-Driven Study Planning`.

### Milestone Editor
Lets the student break an assignment into steps like research, outline, draft, and revision.
PRD ref: `prd.md > Features and Behavior > Milestone-Based Assignment Planning`.

### Reschedule Control
Moves a missed study block to a different open time without changing fixed commitments.
PRD ref: `prd.md > Features and Behavior > Missed-Session Recovery`.

### Time Pressure Warning
Flags when the remaining available time is insufficient to finish the plan realistically.
PRD ref: `prd.md > Features and Behavior > Deadline-Driven Study Planning`.

### Campus Snapshot (stretch goal)
Displays a single-campus layout and walking estimates if the core flow is complete.
PRD ref: `prd.md > Features and Behavior > Stretch Goal: Campus Context`.

## Data Model
Core entities:
- `Assignment`: id, title, course, dueDate, notes, status, milestoneIds
- `Milestone`: id, assignmentId, name, status, plannedStart, plannedEnd
- `Commitment`: id, type (class/work/club), title, start, end, date
- `StudySession`: id, assignmentId, milestoneId, start, end, status (planned/missed/completed)
- `AvailabilityWindow`: id, day, start, end
- `CampusLocation`: id, name, x/y coordinate, category (optional stretch goal)

State rules:
- Fixed commitments always block scheduling.
- Study sessions cannot overlap with commitments.
- The user must confirm assignment extraction before the planner uses that data.
- Each assignment needs at least a due date and one planned milestone or study block to be considered valid.
- Missed sessions may move to another open slot, but they may not overwrite fixed commitments.
- Campus data is optional and never required for the primary workflow.

## File Structure

```text
project/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types/
│   │   └── schedule.ts
│   ├── data/
│   │   ├── sampleAssignments.ts
│   │   └── sampleCampus.ts
│   ├── components/
│   │   ├── SyllabusInput.tsx
│   │   ├── AssignmentConfirmation.tsx
│   │   ├── AvailabilityConfig.tsx
│   │   ├── CommitmentForm.tsx
│   │   ├── StudyPlanner.tsx
│   │   ├── MilestoneEditor.tsx
│   │   ├── ReschedulePanel.tsx
│   │   └── CampusMap.tsx
│   └── lib/
│       ├── parser.ts
│       ├── schedule.ts
│       ├── validation.ts
│       └── campus.ts
├── public/
│   └── assets/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── devpost/
    ├── learner-profile.md
    ├── scope.md
    ├── prd.md
    ├── spec.md
    └── checklist.md
```

## External Services and Dependencies
This first version does not require any external API or hosted service. The planner should be self-contained in the browser and rely on local data and simple client-side calculations.

If campus travel estimates are added, they will use a small static map dataset and not require an external map service.

## Important Failure Modes
- **Syllabus extraction misses or misreads an assignment** → the user sees the parsed data and must correct it before scheduling begins.
- **There is no room before the deadline** → the planner warns that the remaining time is too tight and marks the plan as at risk.
- **A study session is missed** → the student can reschedule it into a different open window without affecting fixed commitments.
- **The session length is too long for the available time** → the app either suggests a shorter block or marks the plan as unrealistic.

## What Was Simplified and Why
- **Lightweight parsing instead of a heavy AI pipeline** — the app needs to be transparent and reliable in a short hackathon timeframe.
- **Manual confirmation gate** — trusted extraction is more important than automation in the first version.
- **Local-only storage and no backend** — the core demo is about scheduling logic, not distributed app infrastructure.
- **Campus map as a stretch goal** — it is useful but not necessary for proving the main idea.

## Decisions and Open Issues
- Decision: syllabus extraction may use a simple parser or lightweight AI-assisted approach, but the app must explain any limitations and require human confirmation before scheduling.
- Decision: study sessions are generated backward from deadlines with a built-in buffer before the due date.
- Decision: classes, work shifts, and club meetings are protected and cannot be moved by the scheduler.
- Decision: the app will warn clearly when there is not enough time to complete the plan realistically.
- Open question: whether to prefer a simple rules-based parser or a lightweight AI-assisted extraction depends on time and transparency needs. The safer default is a simpler parser with clear limitations.
- Stretch goal decision: campus map and walking-time reminders stay optional until the core scheduling flow is validated.
