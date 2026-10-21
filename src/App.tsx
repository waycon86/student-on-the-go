import { useEffect, useMemo, useState } from 'react'
import {
  buildMilestones,
  buildStudyPlan,
  MILESTONE_ORDER,
  rescheduleMissedSessions,
  type AssignmentSettings,
  type Commitment,
  type StudySession,
} from './lib/scheduler'
import './App.css'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type WorkInput = {
  hours: number
  minutes: number
}

const hoursAndMinutesFromTotal = (totalMinutes: number): WorkInput => {
  const normalized = Math.max(0, totalMinutes)
  return {
    hours: Math.floor(normalized / 60),
    minutes: normalized % 60,
  }
}

const totalMinutesFromWorkInput = (input: WorkInput): number => {
  const hours = Number.isFinite(input.hours) ? Math.max(0, Math.trunc(input.hours)) : 0
  const minutes = Number.isFinite(input.minutes)
    ? Math.max(0, Math.min(59, Math.trunc(input.minutes)))
    : 0

  return hours * 60 + minutes
}

const initialAssignment: AssignmentSettings = {
  title: 'Research Essay',
  dueDate: '2026-10-27',
  totalWorkMinutes: 360,
  sessionMinutes: 90,
  bufferMinutes: 60,
  studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  studyStart: '09:00',
  studyEnd: '18:00',
}

const initialCommitments: Commitment[] = [
  {
    id: 'c1',
    title: 'Chemistry Lab',
    date: '2026-10-23',
    start: '09:00',
    end: '11:00',
  },
  {
    id: 'c2',
    title: 'Part-time Job',
    date: '2026-10-24',
    start: '18:00',
    end: '21:00',
  },
  {
    id: 'c3',
    title: 'Club Meeting',
    date: '2026-10-26',
    start: '17:30',
    end: '19:00',
  },
]

function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
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

function formatMinutes(value: number): string {
  const normalized = Math.max(0, value)
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

function App() {
  const [assignment, setAssignment] = useState<AssignmentSettings>(initialAssignment)
  const [commitments, setCommitments] = useState<Commitment[]>(initialCommitments)
  const [draftCommitment, setDraftCommitment] = useState({
    title: 'Work Shift',
    date: '2026-10-25',
    start: '12:00',
    end: '15:00',
  })
  const [now] = useState(() => new Date())
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [workInput, setWorkInput] = useState<WorkInput>(() =>
    hoursAndMinutesFromTotal(initialAssignment.totalWorkMinutes),
  )
  const [sessions, setSessions] = useState<StudySession[]>(() =>
    buildStudyPlan(initialAssignment, initialCommitments, now).sessions,
  )

  const totalWorkMinutes = useMemo(
    () => totalMinutesFromWorkInput(workInput),
    [workInput],
  )

  const workTotalValid = totalWorkMinutes > 0

  const plan = useMemo(
    () => buildStudyPlan({ ...assignment, totalWorkMinutes }, commitments, now),
    [assignment, commitments, now, totalWorkMinutes],
  )

  useEffect(() => {
    setAssignment((current) => ({
      ...current,
      totalWorkMinutes,
    }))
  }, [totalWorkMinutes])

  useEffect(() => {
    setSessions(plan.sessions)
  }, [plan.sessions])

  const milestones = useMemo(
    () => buildMilestones(assignment.totalWorkMinutes),
    [assignment.totalWorkMinutes],
  )

  const completedMinutes = sessions
    .filter((session) => session.status === 'completed')
    .reduce((total) => total + assignment.sessionMinutes, 0)

  const unscheduledMinutes = Math.max(plan.remainingWorkMinutes, 0)

  const updateWorkField = (field: 'hours' | 'minutes', value: string) => {
    const nextValue = Number(value)
    const safeValue = Number.isFinite(nextValue) ? Math.max(0, Math.trunc(nextValue)) : 0

    setWorkInput((current) => {
      const nextInput = {
        ...current,
        [field]: field === 'minutes' ? Math.min(59, safeValue) : safeValue,
      }

      setAssignment((existing) => ({
        ...existing,
        totalWorkMinutes: totalMinutesFromWorkInput(nextInput),
      }))

      return nextInput
    })
  }

  const addCommitment = () => {
    if (!draftCommitment.title || !draftCommitment.date || !draftCommitment.start || !draftCommitment.end) {
      return
    }

    setCommitments((current) => [
      ...current,
      {
        id: `c-${crypto.randomUUID()}`,
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
    setCommitments((current) => current.filter((entry) => entry.id !== id))
  }

  const updateSessionStatus = (id: string, status: StudySession['status']) => {
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, status } : session,
      ),
    )
  }

  const rescheduleUnfinished = () => {
    const refreshed = rescheduleMissedSessions(sessions, assignment, commitments, now)
    setSessions(refreshed)
  }

  const toggleStudyDay = (day: (typeof daysOfWeek)[number]) => {
    setAssignment((current) => ({
      ...current,
      studyDays: current.studyDays.includes(day)
        ? current.studyDays.filter((entry) => entry !== day)
        : [...current.studyDays, day],
    }))
  }

  return (
    <div className={isDark ? 'app-shell dark' : 'app-shell'}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Student on the Go</p>
          <h1>Study planner</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary-button" onClick={() => setIsDark((current) => !current)}>
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="status-pill">Deadline-first planning</div>
        </div>
      </header>

      <main className="planner-grid">
        <section className="panel">
          <h2>Assignment and timing</h2>

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

          <div className="work-input-group">
            <span className="field-label">Estimated total work</span>
            <div className="work-input-row">
              <label>
                Hours
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={workInput.hours}
                  onChange={(event) => updateWorkField('hours', event.target.value)}
                />
              </label>
              <label>
                Minutes
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={workInput.minutes}
                  onChange={(event) => updateWorkField('minutes', event.target.value)}
                />
              </label>
            </div>
            <p className="field-hint">Hours: whole numbers, minimum 0. Minutes: whole numbers, 0–59.</p>
            {!workTotalValid ? (
              <div className="validation-message">
                Enter a total work estimate greater than zero before planning.
              </div>
            ) : null}
          </div>

          <label>
            Study session length (minutes)
            <input
              type="number"
              min={15}
              step={15}
              value={assignment.sessionMinutes}
              onChange={(event) =>
                setAssignment((current) => ({
                  ...current,
                  sessionMinutes: Number(event.target.value) || 45,
                }))
              }
            />
          </label>

          <label>
            Buffer before deadline (minutes)
            <input
              type="number"
              min={0}
              step={15}
              value={assignment.bufferMinutes}
              onChange={(event) =>
                setAssignment((current) => ({
                  ...current,
                  bufferMinutes: Number(event.target.value) || 0,
                }))
              }
            />
          </label>

          <div className="study-days">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                className={assignment.studyDays.includes(day) ? 'day active' : 'day'}
                onClick={() => toggleStudyDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="time-row">
            <label>
              Study starts
              <input
                type="time"
                value={assignment.studyStart}
                onChange={(event) =>
                  setAssignment((current) => ({
                    ...current,
                    studyStart: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Study ends
              <input
                type="time"
                value={assignment.studyEnd}
                onChange={(event) =>
                  setAssignment((current) => ({
                    ...current,
                    studyEnd: event.target.value,
                  }))
                }
              />
            </label>
          </div>
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
                    {formatDate(commitment.date)} · {commitment.start}–{commitment.end}
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => removeCommitment(commitment.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Study plan</h2>

          <div className="summary-grid">
            <div className="summary-card">
              <span>Planned</span>
              <strong>{formatMinutes(plan.plannedMinutes)}</strong>
            </div>
            <div className="summary-card">
              <span>Completed</span>
              <strong>{formatMinutes(completedMinutes)}</strong>
            </div>
            <div className="summary-card warning">
              <span>Unscheduled</span>
              <strong>{formatMinutes(unscheduledMinutes)}</strong>
            </div>
          </div>

          <div className="milestone-list">
            {milestones.map((milestone, index) => (
              <div key={milestone.name} className="milestone-card">
                <span className="milestone-index">{index + 1}</span>
                <div>
                  <strong>{milestone.name}</strong>
                  <p>{MILESTONE_ORDER[index]} · {formatMinutes(milestone.minutes)}</p>
                </div>
              </div>
            ))}
          </div>

          {unscheduledMinutes > 0 ? (
            <div className="warning-box">
              Not enough free time remains before the deadline. {formatMinutes(unscheduledMinutes)} cannot fit without moving a fixed commitment.
            </div>
          ) : (
            <div className="ok-box">This plan fits within the deadline buffer and protected commitments.</div>
          )}

          <div className="session-actions">
            <button type="button" onClick={rescheduleUnfinished}>
              Reschedule unfinished work
            </button>
          </div>

          <ul className="session-list">
            {sessions.length === 0 ? (
              <li className="empty-state">No study blocks fit right now.</li>
            ) : (
              sessions.map((session) => (
                <li key={session.id} className="session-item">
                  <div className="session-meta">
                    <strong>{session.milestone}</strong>
                    <span>
                      {formatDate(session.start.slice(0, 10))} • {formatTime(new Date(session.start))}–{formatTime(new Date(session.end))}
                    </span>
                  </div>
                  <div className="session-controls">
                    <button
                      type="button"
                      className={session.status === 'completed' ? 'status active' : 'status'}
                      onClick={() => updateSessionStatus(session.id, 'completed')}
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      className={session.status === 'missed' ? 'status active warn' : 'status warn'}
                      onClick={() => updateSessionStatus(session.id, 'missed')}
                    >
                      Missed
                    </button>
                    <button
                      type="button"
                      className={session.status === 'planned' ? 'status active neutral' : 'status neutral'}
                      onClick={() => updateSessionStatus(session.id, 'planned')}
                    >
                      Planned
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
