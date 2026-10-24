import assert from 'node:assert/strict'
import { clearCalendarItems, previewCalendarClear } from './calendarCleanup.ts'
import { buildStudyPlan, type AssignmentSettings, type Commitment } from './scheduler.ts'

const active: AssignmentSettings = { title: 'Essay', courseName: ' BIO-101 ', dueDate: '2026-11-20', totalWorkMinutes: 180, sessionMinutes: 45, bufferMinutes: 30, studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], studyStart: '09:00', studyEnd: '18:00' }
const other = { ...active, courseName: 'BIO-101-LAB' }
const unassigned = { ...active, title: 'Personal project', courseName: undefined }
const assignments = [active, { ...active, title: 'Lab report', courseName: 'bio-101' }, other, unassigned]
const commitments: Commitment[] = [
  { id: 'bio', title: 'Lecture', courseName: 'bio-101', date: '2026-11-18', start: '10:00', end: '11:00' },
  { id: 'lab', title: 'Other course', courseName: 'BIO-101-LAB', date: '2026-11-18', start: '12:00', end: '13:00' },
  { id: 'work', title: 'BIO-101 tutoring job', date: '2026-11-18', start: '14:00', end: '15:00' },
]
const before = JSON.stringify({ active, assignments, commitments })
const result = clearCalendarItems(active, assignments, commitments, { kind: 'class', courseName: ' bio-101 ' })
assert.equal(result.assignmentCount, 2, 'current editor and its saved deadline must count once')
assert.equal(result.assignment.totalWorkMinutes, 0)
assert.equal(result.assignment.title, '')
assert.deepEqual(result.assignments, [other, unassigned], 'exact class matching must preserve a similarly named course and unassigned work')
assert.deepEqual(result.commitments.map((item) => item.id), ['lab', 'work'], 'do not infer a course from a busy-time title')
assert.equal(buildStudyPlan(result.assignment, result.commitments, new Date('2026-11-01T12:00:00')).sessions.length, 0, 'removed current assignment must not regenerate study blocks')
assert.equal(JSON.stringify({ active, assignments, commitments }), before, 'preview and removal must not mutate their input snapshot')
const keepActive = clearCalendarItems(active, assignments, commitments, { kind: 'class', courseName: 'BIO-101-LAB' })
assert.equal(keepActive.assignment, active, 'another class must not clear the current editor')
const unlabeled = clearCalendarItems(active, assignments, commitments, { kind: 'class', courseName: '' })
assert.equal(unlabeled.removeActive, false)
assert.equal(unlabeled.assignments.length, 3)
assert.deepEqual(unlabeled.removedCommitments.map((item) => item.id), ['work'])
const all = clearCalendarItems(active, assignments, commitments, { kind: 'all' })
assert.deepEqual(all.assignments, [])
assert.deepEqual(all.commitments, [])
assert.equal(all.assignment.totalWorkMinutes, 0)
assert.equal(previewCalendarClear(active, [], [], { kind: 'class', courseName: 'missing' }).assignmentCount, 0)
assert.equal(previewCalendarClear({ ...active, courseName: 'Course   Name' }, [], [], { kind: 'class', courseName: 'course name' }).removeActive, true)
console.log('calendar cleanup tests passed')
