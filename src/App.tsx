import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import {
  buildMilestones,
  buildMultiAssignmentPlan,
  buildStudyPlan,
  MILESTONE_ORDER,
  rescheduleMissedSessions,
  type AssignmentSettings,
  type Commitment,
  type StudySession,
} from './lib/scheduler'
import {
  DEFAULT_SCHOOL_THEME_ID,
  getSchoolThemeById,
  SCHOOL_THEMES,
  type SchoolTheme,
  type SchoolThemeId,
} from './lib/schoolThemes'
import {
  deduplicateImportedAssignments,
  extractAssignmentsFromText,
  type ParsedAssignment,
} from './lib/syllabus'
import './App.css'

const SCHOOL_THEME_STORAGE_KEY = 'student-on-the-go-school-theme'
const DARK_MODE_STORAGE_KEY = 'student-on-the-go-dark-mode'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/planner', label: 'Planner' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/syllabus', label: 'Syllabus' },
  { to: '/schedule', label: 'My Schedule' },
] as const

type WorkInput = {
  hours: number
  minutes: number
}

type PlannerProps = {
  assignment: AssignmentSettings
  setAssignment: React.Dispatch<React.SetStateAction<AssignmentSettings>>
  commitments: Commitment[]
  setCommitments: React.Dispatch<React.SetStateAction<Commitment[]>>
  draftCommitment: { title: string; date: string; start: string; end: string }
  setDraftCommitment: React.Dispatch<React.SetStateAction<{
    title: string
    date: string
    start: string
    end: string
  }>>
  sylInput: string
  setSylInput: React.Dispatch<React.SetStateAction<string>>
  parsedAssignments: ParsedAssignment[]
  setParsedAssignments: React.Dispatch<React.SetStateAction<ParsedAssignment[]>>
  confirmedAssignments: AssignmentSettings[]
  setConfirmedAssignments: React.Dispatch<React.SetStateAction<AssignmentSettings[]>>
  isDark: boolean
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>
  selectedThemeId: SchoolThemeId
  setSelectedThemeId: React.Dispatch<React.SetStateAction<SchoolThemeId>>
  selectedTheme: SchoolTheme
  workInput: WorkInput
  setWorkInput: React.Dispatch<React.SetStateAction<WorkInput>>
  sessionStatusMap: Record<string, StudySession['status']>
  setSessionStatusMap: React.Dispatch<React.SetStateAction<Record<string, StudySession['status']>>>
  now: Date
  plan: ReturnType<typeof buildStudyPlan>
  combinedPlan: ReturnType<typeof buildMultiAssignmentPlan>
  totalWorkMinutes: number
  workTotalValid: boolean
  sessions: StudySession[]
  milestones: ReturnType<typeof buildMilestones>
  completedMinutes: number
  unscheduledMinutes: number
  handleSyllabusFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  addParsedAssignment: (entry: ParsedAssignment) => void
  removeParsedAssignment: (id: string) => void
  updateParsedAssignment: (
    id: string,
    field: 'title' | 'dueDate' | 'workHours' | 'workMinutes',
    value: string | number,
  ) => void
  updateWorkField: (field: 'hours' | 'minutes', value: string) => void
  addCommitment: () => void
  removeCommitment: (id: string) => void
  updateSessionStatus: (id: string, status: StudySession['status']) => void
  rescheduleUnfinished: () => void
  toggleStudyDay: (day: (typeof daysOfWeek)[number]) => void
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

const sampleSyllabus = `
Research Essay — 2026-10-27
Lab Report — 2026-10-29
Group Presentation — 2026-11-02
`

function formatDate(value: string): string {
  if (!value) return 'Missing date'

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

function TodayPage(props: PlannerProps) {
  const { assignment, commitments, combinedPlan, sessions, confirmedAssignments } = props
  const upcomingAssignments = [...confirmedAssignments].sort((a, b) =>
    new Date(`${a.dueDate}T00:00:00`).getTime() - new Date(`${b.dueDate}T00:00:00`).getTime(),
  )
  const nextSession = sessions[0]

  return (
    <main className="page-content">
      <section className="panel dashboard-panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Today at a glance</h2>
          </div>
        </div>

        <div className="summary-grid compact-grid">
          <div className="summary-card">
            <span>Current assignment</span>
            <strong>{assignment.title}</strong>
          </div>
          <div className="summary-card">
            <span>Due</span>
            <strong>{formatDate(assignment.dueDate)}</strong>
          </div>
          <div className="summary-card warning">
            <span>Protected commitments</span>
            <strong>{commitments.length}</strong>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="panel sub-panel">
            <h3>Next study block</h3>
            {nextSession ? (
              <div className="mini-list">
                <strong>{nextSession.assignmentId}</strong>
                <p>
                  {formatDate(nextSession.start.slice(0, 10))} • {formatTime(new Date(nextSession.start))}–{formatTime(new Date(nextSession.end))}
                </p>
              </div>
            ) : (
              <div className="empty-state">No study blocks are scheduled yet.</div>
            )}
          </div>

          <div className="panel sub-panel">
            <h3>Assignment queue</h3>
            <ul className="mini-list-stack">
              {upcomingAssignments.map((item) => (
                <li key={`${item.title}-${item.dueDate}`}>
                  <strong>{item.title}</strong>
                  <span>{formatDate(item.dueDate)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel dashboard-panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Plan status</p>
            <h2>Weekly snapshot</h2>
          </div>
        </div>

        <div className="summary-grid compact-grid">
          <div className="summary-card">
            <span>Planned</span>
            <strong>{formatMinutes(combinedPlan.plannedMinutes)}</strong>
          </div>
          <div className="summary-card">
            <span>Completed</span>
            <strong>{formatMinutes(props.completedMinutes)}</strong>
          </div>
          <div className="summary-card warning">
            <span>Unscheduled</span>
            <strong>{formatMinutes(props.unscheduledMinutes)}</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function PlannerPage(props: PlannerProps) {
  const { assignment, workTotalValid, combinedPlan, milestones, unscheduledMinutes, updateWorkField, workInput, setAssignment, toggleStudyDay } = props

  return (
    <main className="page-content">
      <section className="panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Planner</p>
            <h2>Study plan</h2>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span>Planned</span>
            <strong>{formatMinutes(combinedPlan.plannedMinutes)}</strong>
          </div>
          <div className="summary-card">
            <span>Completed</span>
            <strong>{formatMinutes(props.completedMinutes)}</strong>
          </div>
          <div className="summary-card warning">
            <span>Unscheduled</span>
            <strong>{formatMinutes(Math.max(combinedPlan.remainingWorkMinutes, unscheduledMinutes))}</strong>
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

        {Math.max(combinedPlan.remainingWorkMinutes, unscheduledMinutes) > 0 ? (
          <div className="warning-box">
            Not enough free time remains before the deadline. {formatMinutes(Math.max(combinedPlan.remainingWorkMinutes, unscheduledMinutes))} cannot fit without moving a fixed commitment.
          </div>
        ) : (
          <div className="ok-box">This plan fits within the deadline buffer and protected commitments.</div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Assignment settings</p>
            <h2>Study inputs</h2>
          </div>
        </div>

        <label>
          Assignment title
          <input
            value={assignment.title}
            onChange={(event) => setAssignment((current) => ({ ...current, title: event.target.value }))}
          />
        </label>

        <label>
          Due date
          <input
            type="date"
            value={assignment.dueDate}
            onChange={(event) => setAssignment((current) => ({ ...current, dueDate: event.target.value }))}
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
          {!workTotalValid ? (
            <div className="validation-message">Enter a total work estimate greater than zero before planning.</div>
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
    </main>
  )
}

function AssignmentsPage(props: PlannerProps) {
  const {
    assignment,
    setAssignment,
    workInput,
    updateWorkField,
    toggleStudyDay,
    draftCommitment,
    setDraftCommitment,
    addCommitment,
    commitments,
    removeCommitment,
    workTotalValid,
  } = props

  return (
    <main className="page-content">
      <section className="panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Assignments</p>
            <h2>Assignment details</h2>
          </div>
        </div>

        <label>
          Assignment title
          <input
            value={assignment.title}
            onChange={(event) => setAssignment((current) => ({ ...current, title: event.target.value }))}
          />
        </label>

        <label>
          Due date
          <input
            type="date"
            value={assignment.dueDate}
            onChange={(event) => setAssignment((current) => ({ ...current, dueDate: event.target.value }))}
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
          {!workTotalValid ? (
            <div className="validation-message">Enter a total work estimate greater than zero before planning.</div>
          ) : null}
        </div>

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
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Fixed commitments</p>
            <h2>Add a commitment</h2>
          </div>
        </div>

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
          <button type="button" onClick={addCommitment}>Add commitment</button>
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
              <button type="button" className="secondary-button" onClick={() => removeCommitment(commitment.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

function SyllabusPage(props: PlannerProps) {
  const {
    sylInput,
    setSylInput,
    parsedAssignments,
    removeParsedAssignment,
    updateParsedAssignment,
    addParsedAssignment,
    handleSyllabusFile,
  } = props

  return (
    <main className="page-content">
      <section className="panel syllabus-panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Syllabus</p>
            <h2>Assignment intake</h2>
          </div>
        </div>

        <div className="source-box">
          <label className="stacked-label">
            Paste syllabus text
            <textarea value={sylInput} rows={7} onChange={(event) => setSylInput(event.target.value)} />
          </label>

          <label className="stacked-label">
            Upload .txt syllabus
            <input type="file" accept=".txt,text/plain" onChange={handleSyllabusFile} />
          </label>
        </div>

        <div className="extraction-note">
          Extraction method: simple rule-based parser for pasted text and .txt uploads only. No PDF support yet, and no AI-generated scheduling is claimed.
        </div>

        <div className="parsed-list">
          {parsedAssignments.length === 0 ? (
            <div className="empty-state">No assignments extracted yet.</div>
          ) : (
            parsedAssignments.map((entry) => (
              <div key={entry.id} className="parsed-item">
                <div className="parsed-top-row">
                  <div>
                    <label>
                      Title
                      <input
                        value={entry.title}
                        onChange={(event) => updateParsedAssignment(entry.id, 'title', event.target.value)}
                      />
                    </label>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => removeParsedAssignment(entry.id)}>
                    Remove
                  </button>
                </div>

                <div className="time-row">
                  <label>
                    Due date
                    <input
                      type="date"
                      value={entry.dueDate}
                      onChange={(event) => updateParsedAssignment(entry.id, 'dueDate', event.target.value)}
                    />
                  </label>
                  <label>
                    Estimated work
                    <div className="mini-work-grid">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={entry.workHours}
                        onChange={(event) =>
                          updateParsedAssignment(entry.id, 'workHours', Number(event.target.value) || 0)
                        }
                      />
                      <span>hr</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        step={1}
                        value={entry.workMinutes}
                        onChange={(event) =>
                          updateParsedAssignment(entry.id, 'workMinutes', Number(event.target.value) || 0)
                        }
                      />
                      <span>min</span>
                    </div>
                  </label>
                </div>

                <div className="source-text-box">
                  <strong>Original source</strong>
                  <p>{entry.sourceText}</p>
                </div>

                {!entry.dueDate ? (
                  <div className="warning-box">
                    Missing or ambiguous date — enter the correct date before confirming this assignment.
                  </div>
                ) : null}

                <div className="parsed-actions">
                  <button type="button" onClick={() => addParsedAssignment(entry)} disabled={!entry.dueDate}>
                    Confirm assignment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function MySchedulePage(props: PlannerProps) {
  const {
    commitments,
    sessions,
    updateSessionStatus,
    rescheduleUnfinished,
    setDraftCommitment,
    draftCommitment,
    addCommitment,
    removeCommitment,
    selectedTheme,
    selectedThemeId,
    setSelectedThemeId,
  } = props

  return (
    <main className="page-content">
      <section className="panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">My Schedule</p>
            <h2>Commitments and sessions</h2>
          </div>
        </div>

        <div className="appearance-block">
          <p className="eyebrow subtle-eyebrow">Appearance</p>
          <label htmlFor="school-theme-select" className="field-label">School theme</label>
          <div className="theme-selector-wrap">
            <select
              id="school-theme-select"
              aria-label="School theme selector"
              value={selectedThemeId}
              onChange={(event) => setSelectedThemeId(event.target.value as SchoolThemeId)}
            >
              {SCHOOL_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <div className="theme-preview" aria-hidden="true">
              <span style={{ background: selectedTheme.primary }} />
              <span style={{ background: selectedTheme.secondary }} />
            </div>
          </div>
          <p className="field-hint">Official university colors are used as the base palette. Supporting shades keep text readable.</p>
        </div>

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
          <button type="button" onClick={addCommitment}>Add commitment</button>
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
              <button type="button" className="secondary-button" onClick={() => removeCommitment(commitment.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Session tracking</p>
            <h2>Current study blocks</h2>
          </div>
          <button type="button" onClick={rescheduleUnfinished}>Reschedule unfinished work</button>
        </div>

        <ul className="session-list">
          {sessions.length === 0 ? (
            <li className="empty-state">No study blocks fit right now.</li>
          ) : (
            sessions.map((session) => (
              <li key={session.id} className="session-item">
                <div className="session-meta">
                  <strong>{session.assignmentId}</strong>
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
  )
}

function AppContent() {
  const [assignment, setAssignment] = useState<AssignmentSettings>(initialAssignment)
  const [commitments, setCommitments] = useState<Commitment[]>(initialCommitments)
  const [draftCommitment, setDraftCommitment] = useState({
    title: 'Work Shift',
    date: '2026-10-25',
    start: '12:00',
    end: '15:00',
  })
  const [sylInput, setSylInput] = useState(sampleSyllabus)
  const [parsedAssignments, setParsedAssignments] = useState<ParsedAssignment[]>(() =>
    extractAssignmentsFromText(sampleSyllabus),
  )
  const [confirmedAssignments, setConfirmedAssignments] = useState<AssignmentSettings[]>([initialAssignment])
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = window.localStorage.getItem(DARK_MODE_STORAGE_KEY)
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [selectedThemeId, setSelectedThemeId] = useState<SchoolThemeId>(() => {
    if (typeof window === 'undefined') return DEFAULT_SCHOOL_THEME_ID
    const saved = window.localStorage.getItem(SCHOOL_THEME_STORAGE_KEY)
    return getSchoolThemeById(saved).id
  })
  const [now] = useState(() => new Date())
  const [workInput, setWorkInput] = useState<WorkInput>(() =>
    hoursAndMinutesFromTotal(initialAssignment.totalWorkMinutes),
  )
  const [sessionStatusMap, setSessionStatusMap] = useState<Record<string, StudySession['status']>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SCHOOL_THEME_STORAGE_KEY, selectedThemeId)
    }
  }, [selectedThemeId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDark))
    }
  }, [isDark])

  const selectedTheme = useMemo(() => getSchoolThemeById(selectedThemeId), [selectedThemeId])
  const appStyle = useMemo(
    () => ({
      ['--theme-primary' as string]: selectedTheme.primary,
      ['--theme-primary-strong' as string]: selectedTheme.primaryStrong,
      ['--theme-primary-soft' as string]: selectedTheme.primarySoft,
      ['--theme-primary-text' as string]: selectedTheme.primaryText,
      ['--theme-secondary' as string]: selectedTheme.secondary,
      ['--theme-secondary-strong' as string]: selectedTheme.secondaryStrong,
      ['--theme-secondary-soft' as string]: selectedTheme.secondarySoft,
      ['--theme-secondary-text' as string]: selectedTheme.secondaryText,
      ['--theme-accent' as string]: selectedTheme.secondary,
    }),
    [selectedTheme],
  )

  const totalWorkMinutes = useMemo(() => totalMinutesFromWorkInput(workInput), [workInput])
  const workTotalValid = totalWorkMinutes > 0

  const combinedPlan = useMemo(
    () => buildMultiAssignmentPlan(confirmedAssignments, commitments, now),
    [confirmedAssignments, commitments, now],
  )

  const plan = useMemo(
    () => buildStudyPlan({ ...assignment, totalWorkMinutes }, commitments, now),
    [assignment, commitments, now, totalWorkMinutes],
  )

  const sessions = useMemo(
    () =>
      plan.sessions.map((session) => ({
        ...session,
        status: sessionStatusMap[session.id] ?? session.status,
      })),
    [plan.sessions, sessionStatusMap],
  )

  const milestones = useMemo(() => buildMilestones(assignment.totalWorkMinutes), [assignment.totalWorkMinutes])

  const completedMinutes = sessions
    .filter((session) => session.status === 'completed')
    .reduce((total) => total + assignment.sessionMinutes, 0)

  const unscheduledMinutes = Math.max(plan.remainingWorkMinutes, 0)

  const updateWorkField = (field: 'hours' | 'minutes', value: string) => {
    const nextValue = Number(value)
    const safeValue = Number.isFinite(nextValue) ? Math.max(0, Math.trunc(nextValue)) : 0
    const nextInput = {
      ...workInput,
      [field]: field === 'minutes' ? Math.min(59, safeValue) : safeValue,
    }

    setWorkInput(nextInput)
    setAssignment((current) => ({
      ...current,
      totalWorkMinutes: totalMinutesFromWorkInput(nextInput),
    }))
  }

  const handleSyllabusFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.txt')) return

    const text = await file.text()
    const extracted = deduplicateImportedAssignments(extractAssignmentsFromText(text))
    setParsedAssignments((current) => deduplicateImportedAssignments([...current, ...extracted]))
    setSylInput((current) => current || text)
    event.target.value = ''
  }

  const addParsedAssignment = (entry: ParsedAssignment) => {
    if (!entry.dueDate) return

    const assignmentToAdd: AssignmentSettings = {
      title: entry.title,
      dueDate: entry.dueDate,
      totalWorkMinutes: totalMinutesFromWorkInput({
        hours: entry.workHours,
        minutes: entry.workMinutes,
      }),
      sessionMinutes: assignment.sessionMinutes,
      bufferMinutes: assignment.bufferMinutes,
      studyDays: assignment.studyDays,
      studyStart: assignment.studyStart,
      studyEnd: assignment.studyEnd,
    }

    setConfirmedAssignments((current) => {
      const index = current.findIndex((item) => item.title.toLowerCase() === entry.title.toLowerCase())
      if (index >= 0) return current
      return [...current, assignmentToAdd]
    })

    setParsedAssignments((current) =>
      current.map((item) => (item.id === entry.id ? { ...item, status: 'confirmed' } : item)),
    )
  }

  const removeParsedAssignment = (id: string) => {
    setParsedAssignments((current) => current.filter((item) => item.id !== id))
  }

  const updateParsedAssignment = (
    id: string,
    field: 'title' | 'dueDate' | 'workHours' | 'workMinutes',
    value: string | number,
  ) => {
    setParsedAssignments((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === 'dueDate') {
          next.isMissingDate = !value
          next.isAmbiguousDate = false
        }
        return next
      }),
    )
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
    setSessionStatusMap((current) => ({
      ...current,
      [id]: status,
    }))
  }

  const rescheduleUnfinished = () => {
    const refreshed = rescheduleMissedSessions(sessions, assignment, commitments, now)
    setSessionStatusMap((current) => {
      const next = { ...current }
      for (const session of refreshed) {
        next[session.id] = session.status
      }
      return next
    })
  }

  const toggleStudyDay = (day: (typeof daysOfWeek)[number]) => {
    setAssignment((current) => ({
      ...current,
      studyDays: current.studyDays.includes(day)
        ? current.studyDays.filter((entry) => entry !== day)
        : [...current.studyDays, day],
    }))
  }

  const location = useLocation()
  const pageTitle =
    location.pathname === '/planner'
      ? 'Planner'
      : location.pathname === '/assignments'
        ? 'Assignments'
        : location.pathname === '/syllabus'
          ? 'Syllabus'
          : location.pathname === '/schedule'
            ? 'My Schedule'
            : 'Today'

  const pageProps: PlannerProps = {
    assignment,
    setAssignment,
    commitments,
    setCommitments,
    draftCommitment,
    setDraftCommitment,
    sylInput,
    setSylInput,
    parsedAssignments,
    setParsedAssignments,
    confirmedAssignments,
    setConfirmedAssignments,
    isDark,
    setIsDark,
    selectedThemeId,
    setSelectedThemeId,
    selectedTheme,
    workInput,
    setWorkInput,
    sessionStatusMap,
    setSessionStatusMap,
    now,
    plan,
    combinedPlan,
    totalWorkMinutes,
    workTotalValid,
    sessions,
    milestones,
    completedMinutes,
    unscheduledMinutes,
    handleSyllabusFile,
    addParsedAssignment,
    removeParsedAssignment,
    updateParsedAssignment,
    updateWorkField,
    addCommitment,
    removeCommitment,
    updateSessionStatus,
    rescheduleUnfinished,
    toggleStudyDay,
  }

  return (
    <div className={isDark ? 'app-shell dark' : 'app-shell'} style={appStyle}>
      <aside className="sidebar desktop-sidebar">
        <div className="brand-block">
          <p className="eyebrow">Student on the Go</p>
          <h1>Plan, study, repeat</h1>
        </div>

        <nav className="nav-menu" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="secondary-button theme-toggle" onClick={() => setIsDark((current) => !current)}>
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>{pageTitle}</h2>
          </div>
          <button type="button" className="secondary-button mobile-theme-toggle" onClick={() => setIsDark((current) => !current)}>
            {isDark ? 'Light' : 'Dark'}
          </button>
        </header>

        <Routes>
          <Route path="/" element={<TodayPage {...pageProps} />} />
          <Route path="/planner" element={<PlannerPage {...pageProps} />} />
          <Route path="/assignments" element={<AssignmentsPage {...pageProps} />} />
          <Route path="/syllabus" element={<SyllabusPage {...pageProps} />} />
          <Route path="/schedule" element={<MySchedulePage {...pageProps} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
