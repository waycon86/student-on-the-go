import { useEffect, useRef, useState } from 'react'
import type { AssignmentSettings, Commitment } from '../lib/scheduler'
import { hasActiveAssignment, normalizeCourseName, previewCalendarClear, type ClearScope } from '../lib/calendarCleanup'

type Props = {
  assignment: AssignmentSettings
  assignments: AssignmentSettings[]
  commitments: Commitment[]
  sessionCount: number
  onLabelActive: (name: string) => void
  onLabelAssignment: (index: number, name: string) => void
  onLabelCommitment: (id: string, name: string) => void
  onClear: (scope: ClearScope) => void
}

export function CalendarCleanup(props: Props) {
  const { assignment, assignments, commitments } = props
  const [course, setCourse] = useState('')
  const [pending, setPending] = useState<ClearScope | null>(null)
  const [message, setMessage] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const courses = new Map<string, string>()
  for (const item of [...(hasActiveAssignment(assignment) ? [assignment] : []), ...assignments, ...commitments]) {
    const key = normalizeCourseName(item.courseName)
    if (key) courses.set(key, item.courseName!.trim())
  }
  const hasUnassigned = (hasActiveAssignment(assignment) && !normalizeCourseName(assignment.courseName))
    || [...assignments, ...commitments].some((item) => !normalizeCourseName(item.courseName))
  const hasItems = hasActiveAssignment(assignment) || assignments.length > 0 || commitments.length > 0
  const selectedCourseExists = course === '__unassigned__' ? hasUnassigned : courses.has(course)
  const preview = pending ? previewCalendarClear(assignment, assignments, commitments, pending) : null
  const scopeLabel = pending?.kind === 'all' ? 'all calendar items' : pending?.courseName.trim() || 'unassigned items'
  const close = () => { dialog.current?.close(); setPending(null) }

  useEffect(() => {
    if (pending && !dialog.current?.open) {
      dialog.current?.showModal()
      cancelButton.current?.focus()
    }
  }, [pending])

  return (
    <section className="panel calendar-cleanup" aria-labelledby="calendar-cleanup-title">
      <h2 id="calendar-cleanup-title">Manage calendar</h2>
      <p>Dropping a class? Clear its assignments, study blocks, and linked busy times, or start over with an empty calendar.</p>
      <details>
        <summary>Add or edit class labels</summary>
        <p>Use the same class name for related items, such as BIO-101. Unlabelled items stay separate; work and clubs only belong to a class if you label them.</p>
        <datalist id="calendar-class-labels">{[...courses.values()].map((name) => <option key={name} value={name} />)}</datalist>
        {hasActiveAssignment(assignment) ? <label>Class for current assignment: {assignment.title || 'Untitled'}<input list="calendar-class-labels" value={assignment.courseName ?? ''} onChange={(event) => props.onLabelActive(event.target.value)} placeholder="Class name (optional)" /></label> : null}
        {assignments.map((item, index) => (
          <label key={index}>Class for saved assignment: {item.title} ({item.dueDate})<input list="calendar-class-labels" value={item.courseName ?? ''} onChange={(event) => props.onLabelAssignment(index, event.target.value)} placeholder="Class name (optional)" /></label>
        ))}
        {commitments.map((item) => (
          <label key={item.id}>Class for busy time: {item.title} ({item.date})<input list="calendar-class-labels" value={item.courseName ?? ''} onChange={(event) => props.onLabelCommitment(item.id, event.target.value)} placeholder="Leave blank for work or other busy time" /></label>
        ))}
        {!hasItems ? <p>There are no calendar items to label.</p> : null}
      </details>
      <label>Class to clear<select aria-label="Class to clear" value={selectedCourseExists ? course : ''} onChange={(event) => setCourse(event.target.value)}>
        <option value="">Choose a class</option>
        {[...courses].sort((a, b) => a[1].localeCompare(b[1])).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
        {hasUnassigned ? <option value="__unassigned__">Unassigned items (no class label)</option> : null}
      </select></label>
      <div className="calendar-cleanup-actions">
        <button type="button" className="secondary-button" disabled={!selectedCourseExists} onClick={() => { setMessage(''); setPending({ kind: 'class', courseName: course === '__unassigned__' ? '' : courses.get(course)! }) }}>Clear one class</button>
        <button type="button" className="secondary-button" disabled={!hasItems} onClick={() => { setMessage(''); setPending({ kind: 'all' }) }}>Clear all</button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      <dialog ref={dialog} className="calendar-clear-dialog" aria-labelledby="calendar-clear-title" onCancel={() => setPending(null)} onClose={() => setPending(null)}>
        {pending && preview ? <>
          <h2 id="calendar-clear-title">Clear {scopeLabel}?</h2>
          <p>This removes {preview.assignmentCount} assignment{preview.assignmentCount === 1 ? '' : 's'}, {preview.removedCommitments.length} busy time{preview.removedCommitments.length === 1 ? '' : 's'}, and {preview.removeActive ? props.sessionCount : 0} currently shown study block{preview.removeActive && props.sessionCount === 1 ? '' : 's'}.</p>
          <ul className="calendar-removal-preview">
            {preview.removeActive && !preview.activeAlreadyListed ? <li>Current assignment: {assignment.title || 'Untitled'}</li> : null}
            {preview.removedAssignments.map((item, index) => <li key={`a-${index}`}>Saved assignment: {item.title} ({item.dueDate})</li>)}
            {preview.removedCommitments.map((item) => <li key={item.id}>Busy time: {item.title} ({item.date})</li>)}
          </ul>
          <p>{pending.kind === 'all' ? 'Your college and appearance settings stay saved.' : 'Items with other class labels stay saved. Remaining study blocks may move into the newly available time.'} Syllabus review drafts stay available. This cannot be undone.</p>
          <div className="calendar-cleanup-actions">
            <button type="button" ref={cancelButton} className="secondary-button" onClick={close}>Cancel</button>
            <button type="button" onClick={() => { props.onClear(pending); setMessage(`Cleared ${scopeLabel}.`); close() }}>Confirm clear</button>
          </div>
        </> : null}
      </dialog>
    </section>
  )
}
