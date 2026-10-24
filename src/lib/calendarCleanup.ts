import type { AssignmentSettings, Commitment } from './scheduler.ts'

export type ClearScope = { kind: 'all' } | { kind: 'class'; courseName: string }

export function normalizeCourseName(value: string | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
}

export function matchesClearScope(item: { courseName?: string }, scope: ClearScope): boolean {
  return scope.kind === 'all' || normalizeCourseName(item.courseName) === normalizeCourseName(scope.courseName)
}

export function hasActiveAssignment(assignment: AssignmentSettings): boolean {
  return Boolean(assignment.title.trim()) || assignment.totalWorkMinutes > 0
}

export function previewCalendarClear(
  assignment: AssignmentSettings,
  assignments: AssignmentSettings[],
  commitments: Commitment[],
  scope: ClearScope,
) {
  const removedAssignments = assignments.filter((item) => matchesClearScope(item, scope))
  const removedCommitments = commitments.filter((item) => matchesClearScope(item, scope))
  const removeActive = hasActiveAssignment(assignment) && matchesClearScope(assignment, scope)
  // The current editor and saved deadline may represent the same assignment.
  const activeAlreadyListed = removedAssignments.some((item) => item.title === assignment.title && item.dueDate === assignment.dueDate && normalizeCourseName(item.courseName) === normalizeCourseName(assignment.courseName))
  return {
    removedAssignments,
    removedCommitments,
    removeActive,
    activeAlreadyListed,
    assignmentCount: removedAssignments.length + (removeActive && !activeAlreadyListed ? 1 : 0),
  }
}

export function clearCalendarItems(
  assignment: AssignmentSettings,
  assignments: AssignmentSettings[],
  commitments: Commitment[],
  scope: ClearScope,
) {
  const preview = previewCalendarClear(assignment, assignments, commitments, scope)
  return {
    ...preview,
    assignment: preview.removeActive ? { ...assignment, title: '', courseName: '', totalWorkMinutes: 0, campusBuildingId: '', roomNumber: '' } : assignment,
    assignments: assignments.filter((item) => !matchesClearScope(item, scope)),
    commitments: commitments.filter((item) => !matchesClearScope(item, scope)),
  }
}
