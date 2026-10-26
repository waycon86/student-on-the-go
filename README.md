# Student on the Go

Student on the Go is a deadline-first planner for students balancing classes, jobs, clubs, and assignment load.

It serves students who need to turn syllabus deadlines into realistic study sessions that respect non-negotiable commitments. Instead of only tracking tasks, Student on the Go builds a schedule backward from due dates, keeps protected time blocks fixed, and warns when there is not enough time to finish.

## What Problem This Solves

Students often know what is due but still miss deadlines because they cannot quickly answer:

- How much time is actually left before this assignment is due?
- Where can study sessions fit around classes, shifts, and meetings?
- What happens when a planned study block is missed?

Student on the Go addresses this with conflict-aware scheduling, milestone planning, and rescheduling support.

## Implemented Features

Current implementation in this repository includes:

- Deadline-aware study planning with configurable study days, time windows, session length, and deadline buffer
- Protected commitments (class, work, club, and other fixed events) that block overlapping study sessions
- Session status tracking (planned, completed, missed) and unfinished-session rescheduling
- Milestone generation for assignment phases (research, outline, draft, revision, finalize)
- Syllabus intake via pasted text, .txt upload, and PDF upload with review/confirmation before scheduling
- Duplicate prevention and editable extracted assignments before import
- Multi-assignment planning support
- Calendar and schedule views with assignment/commitment details
- School-specific color themes for 25 university presets
- Settings-driven college/campus/appearance selection with persistence
- Campus map support:
  - Interactive in-app map on Campus Map page (Leaflet)
  - Building search and marker selection where verified building coordinates exist
  - My classes filter for campus buildings tied to saved assignments/commitments
  - Official campus map links per campus
  - Google Maps walking directions handoff
  - Partial coverage handling for campuses without full verified building datasets

## Requirements

- Node.js 20+ (recommended: latest stable Node 24)
- npm 10+

## Setup and Commands

Install dependencies:

```bash
npm install
```

Start local development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Short Judging Walkthrough (Future-Dated)

Use these example dates so the flow remains demo-friendly:

1. Open the app and go to Settings.
2. Set Your college to Michigan State and Your campus to East Lansing Campus.
3. Keep light or dark mode as preferred.
4. Go to Assignments and create an assignment:
   - Title: Research Essay
   - Due date: 2027-03-18
   - Work estimate: 8 hours 0 minutes
   - Session length: 60 minutes
   - Buffer: 120 minutes
5. Add fixed commitments on 2027-03-12 through 2027-03-17 (class/work/club windows).
6. Verify generated study sessions avoid commitment overlaps.
7. Mark one session missed, then trigger reschedule and confirm fixed commitments remain protected.
8. Open Syllabus, upload or paste sample assignment lines with dates, review extracted items, and import confirmed entries.
9. Open Campus Map, search a building (MSU has verified markers), select one, and use Open walking directions.
10. Use Find my class from an assignment or schedule item and confirm Campus Map opens with the related campus/building context.

## Storage Behavior

Current persistence is browser-local (localStorage), including:

- current assignment inputs
- confirmed assignment list
- commitments
- selected college/theme
- selected campus
- light/dark preference

## Known Limitations

- No account login or cross-device cloud sync in current implementation
- Campus building coverage is partial outside MSU in the current data set
- Walking directions open external Google Maps; indoor routing is not provided
- Campus map route lines are not rendered inside Student on the Go without a verified routing backend

## Devpost Planning Artifacts

- Scope: [agent/devpost/scope.md](agent/devpost/scope.md)
- PRD: [agent/devpost/prd.md](agent/devpost/prd.md)
- Spec: [agent/devpost/spec.md](agent/devpost/spec.md)
- Build checklist: [agent/devpost/checklist.md](agent/devpost/checklist.md)

## Build With AI: Basics Notes

This submission was built using the Devpost Build With AI: Basics workflow and Learn Skill Pack planning structure (scope -> PRD -> spec -> checklist), plus iterative AI coding assistance.

Project foundation and assets used:

- Starter scaffold: React + TypeScript + Vite template
- Core libraries: React, React Router, Leaflet, React Leaflet, pdfjs-dist
- Tooling: TypeScript, ESLint, tsx, Vite
- Visual asset(s): local images under public/images used in app UI

## Clearing a calendar or dropping a class

Open **Settings → Homework and calendar**. Choose a class and select **Clear one class**, or select **Clear all** to start over. Review the assignments, linked busy times, and study blocks, then confirm. Cancel or Escape leaves your calendar unchanged. Clearing cannot be undone; college and appearance settings remain saved. The Calendar page also links to Settings.

Use the optional **Class name** field on assignments, syllabus review entries, and busy times. Existing items can be labelled under **Add or edit class labels** in Settings. Matching ignores capitalization and extra spaces but requires the same class name; unassigned items are separate and can be cleared explicitly. A class is never inferred from a title or campus building. Clearing one class preserves other saved items, although remaining study blocks can move into newly available time. Syllabus review drafts remain available for an explicit later import.

Empty calendars stay empty after reloading; sample assignments are not restored. Calendar data is saved in the current browser.

## License and Author

- License: MIT
- Author: Conway M Benson
