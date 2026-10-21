import { useMemo, useState } from 'react'
import './App.css'

type Assignment = {
  title: string
  dueDate: string
  sessionMinutes: number
}

type Commitment = {
  id: string
  title: string
  date: string
  start: string
  end: string
}

type StudySession = {
  id: string
  title: string
  start: string
  end: string
}

const sampleAssignment: Assignment = {
  title: 'Research Essay',
  dueDate: '2026-10-27',
  sessionMinutes: 90,
}

const sampleCommitments: Commitment[] = [
  {
    id: '1',
    title: 'Chemistry Lab',
    date: '2026-10-23',
    start: '09:00',
    end: '11:00',
  },
  {
    id: '2',
    title: 'Part-time Job',
    date: '2026-10-24',
    start: '18:00',
    end: '21:00',
  },
  {
    id: '3',
    title: 'Club Meeting',
    date: '2026-10-26',
    start: '17:30',
    end: '19:00',
  },
]

function toDateTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(day)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatDateKey(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 60000)
}

function buildStudySessions(
  assignment: Assignment,
  commitments: Commitment[],
): StudySession[] {
  const dueDate = new Date(`${assignment.dueDate}T23:59:59`)
  const bufferMinutes = 60
  const sessions: StudySession[] = []

  for (let offset = 0; offset < 10; offset += 1) {
    const candidateDay = new Date(dueDate)
    candidateDay.setDate(dueDate.getDate() - offset)
    const dayCommitments = commitments.filter(
      (commitment) => commitment.date === dateKey(candidateDay),
    )

    const openSegments: Array<{ start: Date; end: Date }> = []
    let cursor = toDateTime(candidateDay, '08:00')
    const dayEndDate = toDateTime(candidateDay, '20:00')

    const sortedCommitments = [...dayCommitments].sort(
      (a, b) =>
        toDateTime(candidateDay, a.start).getTime() -
        toDateTime(candidateDay, b.start).getTime(),
    )

    for (const commitment of sortedCommitments) {
      const start = toDateTime(candidateDay, commitment.start)
      const end = toDateTime(candidateDay, commitment.end)
      if (start > cursor) {
        openSegments.push({ start: new Date(cursor), end: new Date(start) })
      }
      cursor = new Date(Math.max(cursor.getTime(), end.getTime()))
    }

    if (cursor < dayEndDate) {
      openSegments.push({ start: new Date(cursor), end: new Date(dayEndDate) })
    }

    for (const segment of openSegments) {
      const segmentDuration = minutesBetween(segment.start, segment.end)
      if (segmentDuration < assignment.sessionMinutes) continue

      const untilDue = minutesBetween(segment.end, dueDate)
      if (untilDue < bufferMinutes) continue

      const plannedEnd = new Date(segment.end)
      const plannedStart = new Date(plannedEnd)
      plannedStart.setMinutes(plannedStart.getMinutes() - assignment.sessionMinutes)

      if (plannedStart < segment.start) continue

      const sessionStart = new Date(plannedStart)
      const sessionEnd = new Date(plannedEnd)
      const sessionKey = `${dateKey(sessionStart)}-${sessionStart.getTime()}`

      sessions.push({
        id: sessionKey,
        title: assignment.title,
        start: sessionStart.toISOString(),
        end: sessionEnd.toISOString(),
      })
    }
  }

  return sessions
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 4)
}

function App() {
  const [assignment, setAssignment] = useState<Assignment>(sampleAssignment)
  const [commitments, setCommitments] = useState<Commitment[]>(sampleCommitments)
  const [draftCommitment, setDraftCommitment] = useState({
    title: 'Work Shift',
    date: '2026-10-25',
    start: '12:00',
    end: '15:00',
  })

  const sessions = useMemo(
    () => buildStudySessions(assignment, commitments),
    [assignment, commitments],
  )

  const addCommitment = () => {
    if (!draftCommitment.title || !draftCommitment.date || !draftCommitment.start || !draftCommitment.end) {
      return
    }

    setCommitments((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: draftCommitment.title,
        date: draftCommitment.date,
        start: draftCommitment.start,
        end: draftCommitment.end,
      },
    ])

    setDraftCommitment({
      title: 'Work Shift',
      date: assignment.dueDate,
      start: '12:00',
      end: '15:00',
    })
  }

  const removeCommitment = (id: string) => {
    setCommitments((current) => current.filter((commitment) => commitment.id !== id))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Student on the Go</p>
          <h1>Deadline-aware study planner</h1>
        </div>
        <div className="status-pill">Protected commitments stay fixed</div>
      </header>

      <main className="planner-grid">
        <section className="panel">
          <h2>Assignment</h2>
          <label>
            Assignment title
            <input
              value={assignment.title}
              onChange={(event) =>
                setAssignment((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>

          <label>
            Due date
            <input
              type="date"
              value={assignment.dueDate}
              onChange={(event) =>
                setAssignment((current) => ({ ...current, dueDate: event.target.value }))
              }
            />
          </label>

          <label>
            Study session length (minutes)
            <input
              type="number"
              min={30}
              step={15}
              value={assignment.sessionMinutes}
              onChange={(event) =>
                setAssignment((current) => ({
                  ...current,
                  sessionMinutes: Number(event.target.value) || 60,
                }))
              }
            />
          </label>
        </section>

        <section className="panel">
          <h2>Fixed commitments</h2>
          <div className="commitment-form">
            <label>
              Commitment name
              <input
                value={draftCommitment.title}
                onChange={(event) =>
                  setDraftCommitment((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={draftCommitment.date}
                onChange={(event) =>
                  setDraftCommitment((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </label>
            <div className="time-row">
              <label>
                Start
                <input
                  type="time"
                  value={draftCommitment.start}
                  onChange={(event) =>
                    setDraftCommitment((current) => ({
                      ...current,
                      start: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                End
                <input
                  type="time"
                  value={draftCommitment.end}
                  onChange={(event) =>
                    setDraftCommitment((current) => ({
                      ...current,
                      end: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button type="button" onClick={addCommitment}>
              Add commitment
            </button>
          </div>

          <ul className="commitment-list">
            {commitments.map((commitment) => (
              <li key={commitment.id} className="commitment-item">
                <div>
                  <strong>{commitment.title}</strong>
                  <p>
                    {formatDateKey(commitment.date)} · {commitment.start}–{commitment.end}
                  </p>
                </div>
                <button type="button" onClick={() => removeCommitment(commitment.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Study plan</h2>
          <div className="plan-summary">
            <span>Deadline: {formatDateKey(assignment.dueDate)}</span>
            <span>Session length: {assignment.sessionMinutes} min</span>
          </div>

          {sessions.length === 0 ? (
            <div className="warning-box">
              No study slots fit before the deadline without overlapping a fixed commitment.
            </div>
          ) : (
            <ul className="session-list">
              {sessions.map((session) => (
                <li key={session.id} className="session-item">
                  <div className="session-time">
                    <strong>{new Date(session.start).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short',
                    })}</strong>
                    <span>
                      {formatTime(new Date(session.start))}–{formatTime(new Date(session.end))}
                    </span>
                  </div>
                  <p>{session.title}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
