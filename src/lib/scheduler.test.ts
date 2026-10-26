import assert from 'node:assert/strict'
import { buildMilestones, buildMultiAssignmentPlan, buildStudyPlan, getAssignmentKey, getPlanningAssignments, rescheduleMissedSessions, type AssignmentSettings, type Commitment } from './scheduler.ts'

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

const secondAssignment: AssignmentSettings = {
  ...assignment,
  title: 'Lab Report',
  dueDate: '2026-10-29',
  totalWorkMinutes: 270,
}

const multiPlan = buildMultiAssignmentPlan([assignment, secondAssignment], commitments, now)
assert.equal(multiPlan.sessions.length > 0, true, 'expected multiple assignments to each generate sessions')
assert.equal(
  multiPlan.sessions.every((session, index, list) => {
    if (index === 0) return true
    return new Date(session.start).getTime() >= new Date(list[index - 1].end).getTime()
  }),
  true,
  'multi-assignment sessions should avoid overlaps when shared study windows are used',
)

const milestonePlan = buildMilestones(360)
assert.deepEqual(
  milestonePlan.map((item) => item.name),
  ['Research', 'Outline', 'Draft', 'Revise'],
  'milestones should follow required chronological order',
)


// Clearing the editor must not hide the plans for already imported classes.
const english = { ...assignment, courseName: 'English', title: 'Final project' }
const math = { ...assignment, courseName: 'Math', title: 'Final project' }
const emptyEditor = { ...assignment, title: '', totalWorkMinutes: 0 }
const imported = [english, math]
const allAssignments = getPlanningAssignments(imported, emptyEditor)
const importedPlan = buildMultiAssignmentPlan(allAssignments, commitments, now)
assert.equal(allAssignments.length, 2)
assert.deepEqual(new Set(importedPlan.sessions.map((session) => session.courseName)), new Set(['English', 'Math']))
assert.equal(new Set(importedPlan.sessions.map((session) => session.assignmentKey)).size, 2, 'identical project names in different classes need separate previews')
assert.equal(new Set(importedPlan.sessions.map((session) => session.id)).size, importedPlan.sessions.length)
assert.equal(importedPlan.remainingWorkMinutes, 0)
assert.equal(importedPlan.sessions.every((session, index, list) => index === 0 || new Date(session.start) >= new Date(list[index - 1].end)), true)
assert.equal(importedPlan.sessions.every((session) => commitments.every((busy) => {
  return new Date(session.end) <= new Date(`${busy.date}T${busy.start}`) || new Date(session.start) >= new Date(`${busy.date}T${busy.end}`)
})), true, 'both classes must avoid busy times')

const updatedEnglish = { ...english, totalWorkMinutes: 180 }
const withEditor = getPlanningAssignments(imported, updatedEnglish)
assert.equal(withEditor.length, 2, 'the selected imported assignment must not be scheduled twice')
assert.equal(withEditor.find((entry) => getAssignmentKey(entry) === getAssignmentKey(english))?.totalWorkMinutes, 180)
assert.equal(imported[0].totalWorkMinutes, 360, 'assembling a plan must not mutate saved records')
assert.equal(getPlanningAssignments(imported, { ...assignment, title: 'New assignment' }).length, 3, 'manual assignments must join the shared calendar')
assert.equal(buildMultiAssignmentPlan(getPlanningAssignments([], emptyEditor), commitments, now).sessions.length, 0, 'clear all must leave no study sessions')
const expiredPlan = buildMultiAssignmentPlan([english], [], new Date('2026-10-28T08:00:00'))
assert.equal(expiredPlan.sessions.length, 0)
assert.equal(expiredPlan.remainingWorkMinutes, english.totalWorkMinutes, 'past deadlines must report work that cannot fit')

const oneHourImport = buildMultiAssignmentPlan([{ ...english, totalWorkMinutes: 60, sessionMinutes: 90 }], [], now)
assert.equal(oneHourImport.plannedMinutes, 60, 'an import shorter than the preferred session length must use its actual work estimate')
assert.equal(new Date(oneHourImport.sessions[0].end).getTime() - new Date(oneHourImport.sessions[0].start).getTime(), 60 * 60000)

console.log('scheduler tests passed')
