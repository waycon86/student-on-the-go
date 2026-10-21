import assert from 'node:assert/strict'
import { buildMilestones, buildStudyPlan, rescheduleMissedSessions, type AssignmentSettings, type Commitment } from './scheduler.ts'

const assignment: AssignmentSettings = {
  title: 'Essay',
  dueDate: '2026-10-27',
  totalWorkMinutes: 360,
  sessionMinutes: 90,
  bufferMinutes: 60,
  studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  studyStart: '09:00',
  studyEnd: '18:00',
}

const commitments: Commitment[] = [
  { id: 'class', title: 'Class', date: '2026-10-23', start: '09:00', end: '11:00' },
  { id: 'job', title: 'Work', date: '2026-10-24', start: '18:00', end: '21:00' },
  { id: 'club', title: 'Club', date: '2026-10-26', start: '17:30', end: '19:00' },
]

const now = new Date('2026-10-20T08:00:00')

const plan = buildStudyPlan(assignment, commitments, now)

assert.equal(plan.sessions.length > 0, true, 'expected plan to create sessions')
assert.equal(plan.sessions.every((session) => session.status === 'planned'), true, 'all sessions should start as planned')
assert.equal(plan.remainingWorkMinutes >= 0, true, 'remaining work should never be negative')
assert.equal(plan.plannedMinutes <= assignment.totalWorkMinutes, true, 'planned minutes should not exceed total work')

const overlapFree = plan.sessions.every((session, index, list) => {
  if (index === 0) return true
  const previous = list[index - 1]
  return new Date(session.start).getTime() >= new Date(previous.end).getTime()
})
assert.equal(overlapFree, true, 'planned sessions should not overlap each other')

const deadlineProtected = plan.sessions.every((session) => {
  const deadline = new Date(`${assignment.dueDate}T23:59:59`)
  const bufferDeadline = new Date(deadline)
  bufferDeadline.setMinutes(bufferDeadline.getMinutes() - assignment.bufferMinutes)
  return new Date(session.end) <= bufferDeadline
})
assert.equal(deadlineProtected, true, 'sessions should not extend past the buffer deadline')

const rescheduled = rescheduleMissedSessions(
  [
    ...plan.sessions.slice(0, 1).map((session) => ({ ...session, status: 'completed' as const })),
    ...plan.sessions.slice(1).map((session) => ({ ...session, status: 'missed' as const })),
  ],
  assignment,
  commitments,
  now,
)
assert.equal(Array.isArray(rescheduled), true, 'reschedule output should be an array')
assert.equal(rescheduled.some((session) => session.status === 'completed'), true, 'completed sessions should remain pinned')

const milestonePlan = buildMilestones(360)
assert.deepEqual(
  milestonePlan.map((item) => item.name),
  ['Research', 'Outline', 'Draft', 'Revise'],
  'milestones should follow required chronological order',
)

console.log('scheduler tests passed')
