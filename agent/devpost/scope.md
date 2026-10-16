---
doc: scope
status: approved
---

# Student on the Go

A small student scheduler that helps turn a syllabus, fixed commitments, and deadlines into a realistic study plan that works backward from what must be finished first.

## The Unique Kernel
The core value is not simply tracking tasks — it is turning a syllabus and a student’s real calendar into a plan that respects fixed commitments, protects deadlines with a buffer, and can recover from missed study sessions without moving classes, work hours, or club meetings.

## Who It's For
A student balancing classes, part-time work, club meetings, and multiple assignments. They need a practical way to break work into manageable study sessions, schedule around what cannot move, and know when a plan is no longer realistic before the deadline hits.

## The Core Loop
1. They upload a syllabus or paste coursework details.
2. The app extracts assignment names and due dates using a lightweight parser, and the student confirms the results before scheduling begins.
3. They choose their preferred study session length and available study times.
4. They add fixed commitments like classes, work shifts, and club meetings.
5. The app works backward from the assignment deadline and builds study sessions that avoid overlap with fixed commitments.
6. The student can break each assignment into editable milestones such as research, outline, draft, and revision.
7. If a study session is missed, the student reschedules it into a new available slot without moving fixed commitments.
8. The app flags when there is not enough time left to complete the plan realistically.

## Inspiration & Identity
The app should feel calm, organized, and practical. It should help a student feel in control instead of overwhelmed, with clear blocks for commitments, study work, and deadline pressure.

## Why This Matters to the Learner
A student can lose time quickly when they try to manage deadlines by memory. This app turns each assignment into a manageable plan and makes it obvious when the current schedule is too full to be realistic.

## What "Working" Looks Like
A student uploads or pastes a syllabus, confirms the extracted assignment details, chooses when they can study and how long a study session is, adds fixed commitments, and gets a backward-planned schedule that avoids conflicts. They can break work into milestones, reschedule missed study blocks, and see a clear warning when there is not enough time to finish the work before the deadline.

## The POC Boundary
In scope for the demo:
- syllabus upload or paste-in text
- assignment extraction with a lightweight parser
- explicit confirmation of extracted assignments and deadlines before scheduling
- user-defined study session length (for example, 45 minutes)
- user-defined available study times
- editable assignment milestones such as research, outline, draft, and revision
- fixed commitments: classes, work shifts, club meetings
- backward scheduling from a due date with a deadline buffer
- no overlap between study sessions and fixed commitments
- missed-session rescheduling into another available slot
- clear warning when the plan cannot fit before the deadline
- optional stretch goal: one-campus map and walking-time estimates

Out of scope for the first demo:
- real LMS or email integrations
- multi-campus route optimization
- AI-generated full scheduling across an entire semester
- accounts, login, or sync between devices
- full calendar import/export integrations
- departure reminders and navigation alerts beyond stretch goals

## Later
- stronger syllabus parsing for noisy PDFs and inconsistent formatting
- recurring weekly schedule support
- smarter milestone optimization based on assignment difficulty
- campus walking-time estimates and departure reminders
- notifications and weekly planning summaries

## Explicitly Cut
- Full semester-wide optimization across all courses and commitments
- Automatic rescheduling of fixed classes, work, or club meetings
- Full map-based commuting logic across multiple campuses
- Login, shared accounts, and cross-user scheduling
- AI-dependent extraction as a required first-version feature
