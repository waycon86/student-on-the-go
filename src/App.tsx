import { CalendarCleanup } from './components/CalendarCleanup'
import { clearCalendarItems, hasActiveAssignment, normalizeCourseName, type ClearScope } from './lib/calendarCleanup'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import {
  buildMilestones,
  buildMultiAssignmentPlan,
  buildStudyPlan,
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
  extractAssignmentsFromPdfText,
  extractAssignmentsFromText,
  readSyllabusFile,
  type ParsedAssignment,
} from './lib/syllabus'
import {
  buildCampusDirectionsUrl,
  buildGoogleMapsWalkingUrl,
  CAMPUS_CONFIGS,
  getCampusLabel,
  DEFAULT_CAMPUS_ID,
  getCampusById,
  type CampusBuilding,
  type CampusConfig,
} from './lib/campusData'
import 'leaflet/dist/leaflet.css'
import './App.css'

const SCHOOL_THEME_STORAGE_KEY = 'student-on-the-go-school-theme'
const DARK_MODE_STORAGE_KEY = 'student-on-the-go-dark-mode'
const ASSIGNMENT_STORAGE_KEY = 'student-on-the-go-assignment'
const CONFIRMED_ASSIGNMENTS_STORAGE_KEY = 'student-on-the-go-confirmed-assignments'
const COMMITMENTS_STORAGE_KEY = 'student-on-the-go-commitments'
const CALENDAR_COMPLETION_STORAGE_KEY = 'student-on-the-go-calendar-completion'
const SESSION_STATUS_STORAGE_KEY = 'student-on-the-go-session-status'
const SELECTED_CAMPUS_STORAGE_KEY = 'student-on-the-go-selected-campus'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type WorkInput = { hours: number; minutes: number }

type DraftCommitment = {
  courseName?: string
  title: string
  date: string
  start: string
  end: string
  campusId?: string
  campusBuildingId?: string
  roomNumber?: string
}

type ReadStatus = {
  kind: 'idle' | 'success' | 'error' | 'info'
  message: string
  preview?: string
}

type PlannerProps = {
  assignment: AssignmentSettings
  setAssignment: React.Dispatch<React.SetStateAction<AssignmentSettings>>
  commitments: Commitment[]
  setCommitments: React.Dispatch<React.SetStateAction<Commitment[]>>
  draftCommitment: DraftCommitment
  setDraftCommitment: React.Dispatch<React.SetStateAction<DraftCommitment>>
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
  selectedCampusId: string
  setSelectedCampusId: React.Dispatch<React.SetStateAction<string>>
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
  selectedFileName: string
  readStatus: ReadStatus
  importStatus: ReadStatus
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onReadSyllabus: () => void
  onImportAssignments: () => void
  handleSyllabusFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  addParsedAssignment: (entry: ParsedAssignment) => void
  removeParsedAssignment: (id: string) => void
  updateParsedAssignment: (id: string, field: 'title' | 'dueDate' | 'workHours' | 'workMinutes' | 'courseName', value: string | number) => void
  updateWorkField: (field: 'hours' | 'minutes', value: string) => void
  addCommitment: () => void
  removeCommitment: (id: string) => void
  updateSessionStatus: (id: string, status: StudySession['status']) => void
  rescheduleUnfinished: () => void
  toggleStudyDay: (day: (typeof daysOfWeek)[number]) => void
}

type CalendarItem = {
  id: string
  title: string
  date: string
  kind: 'assignment' | 'study' | 'commitment'
  courseName?: string
  start?: string
  end?: string
  campusId?: string
  campusBuildingId?: string
  roomNumber?: string
}

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/planner', label: 'Planner' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/syllabus', label: 'Syllabus' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/schedule', label: 'My Schedule' },
  { to: '/campus-map', label: 'Campus Map' },
  { to: '/settings', label: 'Settings' },
] as const

const mobileNavItems = [
  { to: '/', label: 'Today', icon: '☀️' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/assignments', label: 'Assignments', icon: '📝' },
  { to: '/syllabus', label: 'Syllabus', icon: '📄' },
  { to: '/more', label: 'More', icon: '⋯' },
] as const

const COLLEGE_UNIVERSITY_NAMES: Record<SchoolThemeId, string[]> = {
  'michigan-state': ['Michigan State University'],
  michigan: ['University of Michigan'],
  'ohio-state': ['The Ohio State University'],
  'penn-state': ['Penn State'],
  wisconsin: ['University of Wisconsin'],
  minnesota: ['University of Minnesota'],
  iowa: ['University of Iowa'],
  nebraska: ['University of Nebraska'],
  indiana: ['Indiana University'],
  purdue: ['Purdue University'],
  illinois: ['University of Illinois'],
  northwestern: ['Northwestern University'],
  rutgers: ['Rutgers University'],
  maryland: ['University of Maryland'],
  oregon: ['University of Oregon'],
  washington: ['University of Washington'],
  ucla: ['University of California, Los Angeles'],
  usc: ['University of Southern California'],
  'notre-dame': ['University of Notre Dame'],
  alabama: ['University of Alabama'],
  georgia: ['University of Georgia'],
  texas: ['University of Texas at Austin'],
  florida: ['University of Florida'],
  'virginia-tech': ['Virginia Tech'],
  'southern-new-hampshire-university': ['Southern New Hampshire University'],
}

function getCampusesForCollege(collegeId: SchoolThemeId): CampusConfig[] {
  const targetUniversities = COLLEGE_UNIVERSITY_NAMES[collegeId] ?? []
  const matches = CAMPUS_CONFIGS.filter((campus) => targetUniversities.includes(campus.universityName))
  return matches.length > 0 ? matches : [getCampusById(DEFAULT_CAMPUS_ID)]
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
  campusId: DEFAULT_CAMPUS_ID,
  campusBuildingId: '',
  roomNumber: '',
}

const initialCommitments: Commitment[] = [
  { id: 'c1', title: 'Chemistry Lab', date: '2026-10-23', start: '09:00', end: '11:00' },
  { id: 'c2', title: 'Part-time Job', date: '2026-10-24', start: '18:00', end: '21:00' },
  { id: 'c3', title: 'Club Meeting', date: '2026-10-26', start: '17:30', end: '19:00' },
]

const sampleSyllabus = `
Research Essay — 2026-10-27
Lab Report — 2026-10-29
Group Presentation — 2026-11-02
`

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = window.localStorage.getItem(key)
    if (!saved) return fallback
    return JSON.parse(saved) as T
  } catch {
    return fallback
  }
}

function getLocationSelectOptions(campusId: string | null | undefined): CampusBuilding[] {
  return getCampusById(campusId ?? DEFAULT_CAMPUS_ID).buildings
}

function getLocationSummary(campusId: string | null | undefined, buildingId: string | undefined, roomNumber?: string) {
  const campus = getCampusById(campusId ?? DEFAULT_CAMPUS_ID)
  const building = campus.buildings.find((entry) => entry.id === buildingId)
  if (!building) return null

  return {
    campus,
    building,
    roomNumber: roomNumber?.trim() || '',
    directionsUrl: buildCampusDirectionsUrl(campus.id, building.id, roomNumber),
  }
}

function formatLocationText(campusId: string | null | undefined, buildingId: string | undefined, roomNumber?: string) {
  const summary = getLocationSummary(campusId, buildingId, roomNumber)
  if (!summary) return null
  const roomText = summary.roomNumber ? `Room ${summary.roomNumber}` : 'Building location'
  return `${roomText} · Directions lead to ${summary.building.name}.`
}

function hoursAndMinutesFromTotal(totalMinutes: number): WorkInput {
  const normalized = Math.max(0, totalMinutes)
  return { hours: Math.floor(normalized / 60), minutes: normalized % 60 }
}

function totalMinutesFromWorkInput(input: WorkInput): number {
  const hours = Number.isFinite(input.hours) ? Math.max(0, Math.trunc(input.hours)) : 0
  const minutes = Number.isFinite(input.minutes) ? Math.max(0, Math.min(59, Math.trunc(input.minutes))) : 0
  return hours * 60 + minutes
}

function formatSessionAssignmentTitle(assignmentId: string): string {
  return assignmentId.replace(/-\d{4}-\d{2}-\d{2}(?:T.*)?$/, '')
}

function formatDate(value: string): string {
  if (!value) return 'Missing date'
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatMinutes(value: number): string {
  const normalized = Math.max(0, value)
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

function formatTodayHeaderDate(value: Date): string {
  return value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function buildCampusMapPath(campusId: string | null | undefined, buildingId: string | undefined, roomNumber?: string): string {
  const params = new URLSearchParams()
  if (campusId) params.set('campus', campusId)
  if (buildingId) params.set('building', buildingId)
  if (roomNumber?.trim()) params.set('room', roomNumber.trim())
  const query = params.toString()
  return query ? `/campus-map?${query}` : '/campus-map'
}

function hasValidCoordinates(building: CampusBuilding): building is CampusBuilding & { latitude: number; longitude: number } {
  return typeof building.latitude === 'number' && Number.isFinite(building.latitude) && typeof building.longitude === 'number' && Number.isFinite(building.longitude)
}

function toAddressLine(building: CampusBuilding): string {
  return building.address ?? building.destination
}

function AssignmentLocationFields({
  assignment,
  setAssignment,
  selectedCampusId,
}: {
  assignment: AssignmentSettings
  setAssignment: React.Dispatch<React.SetStateAction<AssignmentSettings>>
  selectedCampusId: string
}) {
  const effectiveCampusId = assignment.campusId ?? selectedCampusId
  const classLocation = getLocationSummary(effectiveCampusId, assignment.campusBuildingId, assignment.roomNumber)

  return (
    <>
      <div className="time-row">
        <label>
          Campus building (optional)
          <select
            value={assignment.campusBuildingId ?? ''}
            onChange={(event) => setAssignment((current) => ({ ...current, campusId: selectedCampusId, campusBuildingId: event.target.value || undefined }))}
          >
            <option value="">No building selected</option>
            {getLocationSelectOptions(selectedCampusId).map((building) => (
              <option key={building.id} value={building.id}>{building.name}</option>
            ))}
          </select>
        </label>
        <label>
          Room number (optional)
          <input
            value={assignment.roomNumber ?? ''}
            onChange={(event) => setAssignment((current) => ({ ...current, roomNumber: event.target.value || undefined }))}
            placeholder="e.g. 204"
          />
        </label>
      </div>

      {classLocation ? (
        <div className="campus-route-box">
          <strong>{formatLocationText(effectiveCampusId, assignment.campusBuildingId, assignment.roomNumber)}</strong>
          <small>Directions open Google Maps walking directions to the building entrance.</small>
          <a className="primary-link-button" href={buildCampusMapPath(effectiveCampusId, assignment.campusBuildingId, assignment.roomNumber)}>Find my class</a>
        </div>
      ) : null}
    </>
  )
}

function TodayPage(props: PlannerProps) {
  const { assignment, commitments, combinedPlan, sessions, confirmedAssignments, updateSessionStatus } = props
  const upcomingAssignments = [...confirmedAssignments].sort(
    (a, b) => new Date(`${a.dueDate}T00:00:00`).getTime() - new Date(`${b.dueDate}T00:00:00`).getTime(),
  )
  const nextSession = sessions[0]
  const todayCommitments = commitments.filter((commitment) => commitment.date === new Date().toISOString().slice(0, 10))
  const todayStudyBlocks = sessions.filter((session) => session.start.slice(0, 10) === new Date().toISOString().slice(0, 10))

  return (
    <main className="page-content mobile-page-content">
      <section className="panel getting-started" aria-labelledby="getting-started-title">
        <p className="eyebrow">New here? Start here</p>
        <h2 id="getting-started-title">Find study time around your classes and work.</h2>
        <p className="getting-started-description">
          Student on the Go turns assignment deadlines into study blocks that fit your available time.
        </p>
        <div className="getting-started-actions">
          <NavLink className="getting-started-primary" to="/assignments">Plan my assignment</NavLink>
          <NavLink className="getting-started-secondary" to="/syllabus">Import a syllabus</NavLink>
        </div>
        <ol className="getting-started-steps" aria-label="How to use Student on the Go">
          <li>
            <NavLink to="/assignments">
              <span className="getting-started-number" aria-hidden="true">1</span>
              <span><strong>Add an assignment</strong><span className="getting-started-step-description">Enter a due date and estimate how long the work will take.</span></span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/schedule">
              <span className="getting-started-number" aria-hidden="true">2</span>
              <span><strong>Add your busy times</strong><span className="getting-started-step-description">Add classes, work shifts, and other time you cannot study.</span></span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar">
              <span className="getting-started-number" aria-hidden="true">3</span>
              <span><strong>See your study plan</strong><span className="getting-started-step-description">Open the calendar to see when to study before your deadline.</span></span>
            </NavLink>
          </li>
        </ol>
        <p className="getting-started-note">
          First visit? An example plan is included. Replace it with your own assignment and busy times.
        </p>
      </section>

      <section className="panel dashboard-panel mobile-section">
        <p className="page-intro">Your next study session, upcoming deadlines, and busy times are below.</p>

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
            <span>Classes & busy times</span>
            <strong>{commitments.length}</strong>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="panel sub-panel">
            <h3>Next study block</h3>
            {nextSession ? (
              <div className="mini-list">
                <strong>{formatSessionAssignmentTitle(nextSession.assignmentId)}</strong>
                <p>{formatDate(nextSession.start.slice(0, 10))} • {formatTime(new Date(nextSession.start))}–{formatTime(new Date(nextSession.end))}</p>
              </div>
            ) : (
              <div className="empty-state">No study blocks are scheduled yet. Add an assignment to get started.</div>
            )}
          </div>

          <div className="panel sub-panel">
            <h3>Upcoming deadlines</h3>
            {upcomingAssignments.length === 0 ? (
              <div className="empty-state">No upcoming deadlines yet.</div>
            ) : (
              <ul className="mini-list-stack">
                {upcomingAssignments.slice(0, 3).map((item) => (
                  <li key={`${item.title}-${item.dueDate}`}>
                    <strong>{item.title}</strong>
                    <span>{formatDate(item.dueDate)}</span>
                    {getLocationSummary(item.campusId, item.campusBuildingId, item.roomNumber) ? (
                      <a className="secondary-button" href={buildCampusMapPath(item.campusId ?? DEFAULT_CAMPUS_ID, item.campusBuildingId, item.roomNumber)}>Find my class</a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="panel sub-panel mobile-surface">
          <h3>Today’s classes & busy times</h3>
          {todayCommitments.length === 0 ? (
            <div className="empty-state">No commitments are scheduled for today. You have a clear day.</div>
          ) : (
            <ul className="mini-list-stack">
              {todayCommitments.map((item) => {
                const location = getLocationSummary(item.campusId, item.campusBuildingId, item.roomNumber)
                return (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.start}–{item.end}</span>
                    {location ? <span>{formatLocationText(item.campusId, item.campusBuildingId, item.roomNumber)}</span> : null}
                    {location ? <a className="secondary-button" href={buildCampusMapPath(item.campusId ?? DEFAULT_CAMPUS_ID, item.campusBuildingId, item.roomNumber)}>Find my class</a> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="panel sub-panel mobile-surface">
          <h3>Today’s study checklist</h3>
          {todayStudyBlocks.length === 0 ? (
            <div className="empty-state">No study blocks are scheduled for today.</div>
          ) : (
            <ul className="checkoff-list">
              {todayStudyBlocks.map((session) => (
                <li key={session.id} className={session.status === 'completed' ? 'checkoff-item done' : 'checkoff-item'}>
                  <label>
                    <input
                      type="checkbox"
                      checked={session.status === 'completed'}
                      onChange={(event) => updateSessionStatus(session.id, event.target.checked ? 'completed' : 'planned')}
                    />
                    <span>
                      <strong>{formatSessionAssignmentTitle(session.assignmentId)}</strong>
                      <small>{formatTime(new Date(session.start))}–{formatTime(new Date(session.end))}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel dashboard-panel mobile-section">
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
            <span>Time that won’t fit</span>
            <strong>{formatMinutes(props.unscheduledMinutes)}</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function PlannerPage(props: PlannerProps) {
  const { assignment, workTotalValid, plan, milestones, unscheduledMinutes, updateWorkField, workInput, setAssignment, toggleStudyDay, sessions } = props
  const previewRef = useRef<HTMLElement>(null)
  const validSettings = Boolean(assignment.title.trim() && /^\d{4}-\d{2}-\d{2}$/.test(assignment.dueDate) && workTotalValid && assignment.sessionMinutes >= 15 && assignment.studyDays.length && assignment.studyStart < assignment.studyEnd)
  const safeDeadline = new Date(`${assignment.dueDate}T23:59:59`)
  safeDeadline.setMinutes(safeDeadline.getMinutes() - assignment.bufferMinutes)
  const dateTime = (value: string | Date) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit' })
  const firstSession = sessions[0]
  const lastSession = sessions[sessions.length - 1]

  return (
    <main className="page-content intuitive-planner">
      <section className="panel">
        <p className="eyebrow">Planner</p>
        <h2>Start with your due date</h2>
        <p>Tell us what is due and when you can study. We work backward to find time around your classes and busy times.</p>
        {props.confirmedAssignments.length > 0 ? <label>Load an imported assignment
          <select value="" onChange={(event) => {
            if (event.target.value === '') return
            const selected = props.confirmedAssignments[Number(event.target.value)]
            setAssignment({ ...selected })
            props.setWorkInput({ hours: Math.floor(selected.totalWorkMinutes / 60), minutes: selected.totalWorkMinutes % 60 })
          }}>
            <option value="">Choose an assignment…</option>
            {props.confirmedAssignments.map((item, index) => <option key={index} value={index}>{item.courseName ? `${item.courseName} · ` : ''}{item.title} · {formatDate(item.dueDate)}</option>)}
          </select>
        </label> : <NavLink to="/syllabus">Import assignments from a syllabus</NavLink>}
        <p className="workflow-help">Your current plan updates as you change these settings. Imported assignment records are kept separately.</p>
        <div className="planner-setup-grid">
        <fieldset className="planner-step"><legend>1. Assignment &amp; deadline</legend>
        <label>Assignment title<input value={assignment.title} onChange={(event) => setAssignment((current) => ({ ...current, title: event.target.value }))} /></label>
        <label>Class name (optional)<input value={assignment.courseName ?? ''} onChange={(event) => setAssignment((current) => ({ ...current, courseName: event.target.value }))} placeholder="e.g. BIO-101" /></label>
        <label>Due date<input type="date" value={assignment.dueDate} onChange={(event) => setAssignment((current) => ({ ...current, dueDate: event.target.value }))} /></label>

        </fieldset>
        <fieldset className="planner-step"><legend>2. Time needed</legend>
        <div className="work-input-group"><p className="workflow-help">How much time will this assignment take altogether? An estimate is fine.</p><span className="field-label">Total time needed</span>
          <div className="work-input-row">
            <label>Hours<input type="number" min={0} step={1} value={workInput.hours} onChange={(event) => updateWorkField('hours', event.target.value)} /></label>
            <label>Minutes<input type="number" min={0} max={59} step={1} value={workInput.minutes} onChange={(event) => updateWorkField('minutes', event.target.value)} /></label>
          </div>
          {!workTotalValid ? <div className="validation-message">Enter a total work estimate greater than zero before planning.</div> : null}
        </div>

<label>Minutes per study session<input type="number" min={15} step={15} value={assignment.sessionMinutes} onChange={(event) => setAssignment((current) => ({ ...current, sessionMinutes: Number(event.target.value) || 45 }))} /></label>


        <p className="field-label">When should the work be finished?</p>
        <div className="planner-buffer-options" role="group" aria-label="Finish early presets">
          {[{ label: 'On the due date', minutes: 0 }, { label: '1 day early', minutes: 1440 }, { label: '2 days early', minutes: 2880 }].map((option) => <button key={option.minutes} type="button" className="secondary-button" aria-pressed={assignment.bufferMinutes === option.minutes} onClick={() => setAssignment((current) => ({ ...current, bufferMinutes: option.minutes }))}>{option.label}</button>)}
        </div>
        <details className="planner-custom-buffer" open={![0, 1440, 2880].includes(assignment.bufferMinutes)}><summary>Custom finish-early time</summary><label>Finish early by (minutes)<input type="number" min={0} step={15} value={assignment.bufferMinutes} onChange={(event) => setAssignment((current) => ({ ...current, bufferMinutes: Number(event.target.value) || 0 }))} /></label></details>
        </fieldset>
        <fieldset className="planner-step"><legend>3. Your availability</legend>
        <p className="field-label">Which days can you study?</p>
        <div className="study-days">
          {daysOfWeek.map((day) => (
            <button key={day} type="button" aria-pressed={assignment.studyDays.includes(day)} className={assignment.studyDays.includes(day) ? 'day active' : 'day'} onClick={() => toggleStudyDay(day)}>{assignment.studyDays.includes(day) ? <span className="day-check" aria-hidden="true">✓</span> : null}{day}</button>
          ))}
        </div>

        <div className="time-row">
          <label>Study starts<input type="time" value={assignment.studyStart} onChange={(event) => setAssignment((current) => ({ ...current, studyStart: event.target.value }))} /></label>
          <label>Study ends<input type="time" value={assignment.studyEnd} onChange={(event) => setAssignment((current) => ({ ...current, studyEnd: event.target.value }))} /></label>
        </div>


        <p className="workflow-help">Study sessions will avoid the busy times you have added.</p>
        <NavLink to="/schedule">Edit classes and busy times</NavLink>
        </fieldset>
        </div>
        <details className="planner-location"><summary>Add a campus location (optional)</summary>
          <AssignmentLocationFields assignment={assignment} setAssignment={setAssignment} selectedCampusId={props.selectedCampusId} />
        </details>
        <div className="planner-review-action"><button type="button" onClick={() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>See my study plan</button></div>
      </section>

      <section className="panel planner-preview" ref={previewRef} tabIndex={-1}>
        <p className="eyebrow">Your plan, working backward</p>
        <h2>{assignment.title.trim() || 'Your assignment'}</h2>
        {!validSettings ? <p className="validation-message" role="status">Enter an assignment title, due date, and work estimate. Choose at least one study day, a session length of 15 minutes or more, and an end time after your start time.</p> : <>
          <ol className="planner-deadline-path">
            <li><span>Due</span><strong>{formatDate(assignment.dueDate)} · 11:59 PM</strong></li>
            <li><span>Finish by</span><strong>{dateTime(safeDeadline)}</strong></li>
            <li><span>{unscheduledMinutes > 0 ? 'First available session' : 'Start studying'}</span><strong>{firstSession ? dateTime(firstSession.start) : 'No sessions fit yet'}</strong></li>
          </ol>
          <p className="workflow-help">We fill your latest available study times first, working back from the finish-by time. Sessions may fall on the same day. Classes and busy times are protected.</p>
          {safeDeadline < props.now ? <p className="validation-message" role="status">Your finish-by time has already passed. Choose a future due date or reduce the finish-early buffer.</p> : null}
          {unscheduledMinutes > 0 ? <div className="validation-message" role="status"><strong>{formatMinutes(unscheduledMinutes)} still needs time.</strong> Add study days, widen your study hours, shorten your sessions, or reduce the finish-early buffer.</div> : <p className="status-message success" role="status">Your {formatMinutes(props.totalWorkMinutes)} estimate fits in {sessions.length} study session{sessions.length === 1 ? '' : 's'}.</p>}
          <h3>Your study sessions, in order</h3>
          <ol className="planner-session-timeline">
            {sessions.map((session, index) => <li key={session.id}>
              <div><strong>Session {index + 1}{index === 0 ? ' · Start here' : ''}</strong><span>{dateTime(session.start)} – {formatTime(new Date(session.end))}</span><small>{formatMinutes(Math.round((new Date(session.end).getTime() - new Date(session.start).getTime()) / 60000))}</small></div>
              <label className="planner-session-check"><input type="checkbox" checked={session.status === 'completed'} onChange={(event) => props.updateSessionStatus(session.id, event.target.checked ? 'completed' : 'planned')} />Done</label>
            </li>)}
          </ol>
          {lastSession ? <p>Last scheduled session ends {dateTime(lastSession.end)}.</p> : <p>No study sessions fit. Adjust your availability above.</p>}
          <p className="workflow-help">Scheduled: {formatMinutes(plan.plannedMinutes)} · Completed: {formatMinutes(props.completedMinutes)}</p>
          <div className="planner-preview-actions"><NavLink className="primary-link-button" to="/calendar">Open calendar</NavLink><button type="button" className="secondary-button" onClick={props.rescheduleUnfinished}>Reschedule unfinished work</button></div>
          <details><summary>Suggested work breakdown</summary><p>These are time estimates for organizing the assignment, rather than dated milestones.</p><ul>{milestones.map((milestone) => <li key={milestone.name}>{milestone.name}: {formatMinutes(milestone.minutes)}</li>)}</ul></details>
        </>}
      </section>
    </main>
  )
}

function AssignmentsPage(props: PlannerProps) {
  const { assignment, setAssignment, workInput, updateWorkField, toggleStudyDay, draftCommitment, setDraftCommitment, addCommitment, commitments, removeCommitment, workTotalValid } = props

  return (
    <main className="page-content">
      <section className="panel">
        <div className="panel-header-row"><div><p className="eyebrow">Assignments</p><h2>Assignment details</h2></div></div>
        <p className="workflow-help">Replace the example below with your assignment, due date, and work estimate. Choose the days and times you can study. Your study blocks update as you edit.</p>
        <label>Assignment title<input value={assignment.title} onChange={(event) => setAssignment((current) => ({ ...current, title: event.target.value }))} /></label>
        <label>Class name (optional)<input value={assignment.courseName ?? ''} onChange={(event) => setAssignment((current) => ({ ...current, courseName: event.target.value }))} placeholder="e.g. BIO-101" /></label>
        <label>Due date<input type="date" value={assignment.dueDate} onChange={(event) => setAssignment((current) => ({ ...current, dueDate: event.target.value }))} /></label>

        <div className="work-input-group">
          <span className="field-label">Estimated total work</span>
          <div className="work-input-row">
            <label>Hours<input type="number" min={0} step={1} value={workInput.hours} onChange={(event) => updateWorkField('hours', event.target.value)} /></label>
            <label>Minutes<input type="number" min={0} max={59} step={1} value={workInput.minutes} onChange={(event) => updateWorkField('minutes', event.target.value)} /></label>
          </div>
          {!workTotalValid ? <div className="validation-message">Enter a total work estimate greater than zero before planning.</div> : null}
        </div>

        <div className="study-days">
          {daysOfWeek.map((day) => (
            <button key={day} type="button" aria-pressed={assignment.studyDays.includes(day)} className={assignment.studyDays.includes(day) ? 'day active' : 'day'} onClick={() => toggleStudyDay(day)}>{assignment.studyDays.includes(day) ? <span className="day-check" aria-hidden="true">✓</span> : null}{day}</button>
          ))}
        </div>

        <div className="time-row">
          <label>Study starts<input type="time" value={assignment.studyStart} onChange={(event) => setAssignment((current) => ({ ...current, studyStart: event.target.value }))} /></label>
          <label>Study ends<input type="time" value={assignment.studyEnd} onChange={(event) => setAssignment((current) => ({ ...current, studyEnd: event.target.value }))} /></label>
        </div>

        <AssignmentLocationFields assignment={assignment} setAssignment={setAssignment} selectedCampusId={props.selectedCampusId} />
        <p className="workflow-help">Assignment changes are saved in this browser.</p>
        <div className="getting-started-actions">
          <NavLink className="getting-started-primary" to="/schedule">Next: add busy times</NavLink>
          <NavLink className="getting-started-secondary" to="/calendar">View my study plan</NavLink>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row"><div><p className="eyebrow">Fixed commitments</p><h2>Add busy time</h2></div></div>

        <div className="commitment-form">
          <label>Class or busy time<input value={draftCommitment.title} onChange={(event) => setDraftCommitment((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Class name (optional)<input value={draftCommitment.courseName ?? ''} onChange={(event) => setDraftCommitment((current) => ({ ...current, courseName: event.target.value }))} placeholder="Leave blank for work or clubs" /></label>
          <label>Date<input type="date" value={draftCommitment.date} onChange={(event) => setDraftCommitment((current) => ({ ...current, date: event.target.value }))} /></label>
          <div className="time-row">
            <label>Start<input type="time" value={draftCommitment.start} onChange={(event) => setDraftCommitment((current) => ({ ...current, start: event.target.value }))} /></label>
            <label>End<input type="time" value={draftCommitment.end} onChange={(event) => setDraftCommitment((current) => ({ ...current, end: event.target.value }))} /></label>
          </div>
          <div className="time-row">
            <label>
              Campus building (optional)
              <select
                value={draftCommitment.campusBuildingId ?? ''}
                onChange={(event) => setDraftCommitment((current) => ({ ...current, campusId: props.selectedCampusId, campusBuildingId: event.target.value || undefined }))}
              >
                <option value="">No building selected</option>
                {getLocationSelectOptions(props.selectedCampusId).map((building) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </label>
            <label>Room number (optional)<input value={draftCommitment.roomNumber ?? ''} onChange={(event) => setDraftCommitment((current) => ({ ...current, roomNumber: event.target.value || undefined }))} placeholder="e.g. 101" /></label>
          </div>
          <button type="button" onClick={addCommitment}>Add busy time</button>
        </div>

        <ul className="commitment-list">
          {commitments.map((commitment) => {
            const location = getLocationSummary(commitment.campusId, commitment.campusBuildingId, commitment.roomNumber)
            return (
              <li key={commitment.id} className="commitment-item">
                <div>
                  <strong>{commitment.title}</strong>
                  <p>{formatDate(commitment.date)} · {commitment.start}–{commitment.end}</p>
                  {location ? <p>{formatLocationText(commitment.campusId, commitment.campusBuildingId, commitment.roomNumber)}</p> : null}
                </div>
                <div className="campus-actions">
                  {location ? <a className="secondary-button" href={buildCampusMapPath(commitment.campusId ?? DEFAULT_CAMPUS_ID, commitment.campusBuildingId, commitment.roomNumber)}>Find my class</a> : null}
                  <button type="button" className="secondary-button" onClick={() => removeCommitment(commitment.id)}>Remove</button>
                </div>
              </li>
            )
          })}
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
    selectedFileName,
    readStatus,
    importStatus,
    onReadSyllabus,
    onImportAssignments,
    fileInputRef,
  } = props

  const hasValidAssignments = parsedAssignments.filter((entry) => entry.title.trim() && entry.dueDate && !entry.isMissingDate).length > 0

  return (
    <main className="page-content mobile-page-content">
      <section className="panel syllabus-panel mobile-section">
        <div className="mobile-page-header">
          <div><p className="eyebrow">Syllabus</p><h2>3-step import</h2></div>
          <button type="button" className="primary-button mobile-primary-action" onClick={onImportAssignments} disabled={!hasValidAssignments}>Import</button>
        </div>
        <p className="workflow-help">1. Paste your syllabus and select Read syllabus, or upload a file. 2. Review the assignment names, dates, and work estimates below. 3. Select Import to add them to your planner.</p>

        <div className="source-box">
          <label className="stacked-label">Paste syllabus text<textarea value={sylInput} rows={7} onChange={(event) => setSylInput(event.target.value)} /></label>
          <div className="file-upload-box">
            <label className="stacked-label">Upload syllabus (.txt or PDF)<input ref={fileInputRef} type="file" accept=".txt,.pdf,text/plain,application/pdf" onChange={handleSyllabusFile} /></label>
            <button type="button" className="secondary-button" onClick={onReadSyllabus}>Read syllabus</button>
          </div>
          {selectedFileName ? <div className="file-status-card"><strong>Selected file</strong><span>{selectedFileName}</span></div> : null}
          {readStatus.message ? <div className={`status-message ${readStatus.kind}`}>{readStatus.message}</div> : null}
          {readStatus.preview ? <div className="source-text-box"><strong>Extracted text preview</strong><p>{readStatus.preview}</p></div> : null}
          {importStatus.message ? <div className={`status-message ${importStatus.kind}`}>{importStatus.message}</div> : null}
        </div>

        <div className="parsed-list">
          {parsedAssignments.length === 0 ? (
            <div className="empty-state">No assignments extracted yet. Upload a file or paste syllabus text.</div>
          ) : (
            parsedAssignments.map((entry) => (
              <div key={entry.id} className="parsed-item">
                <div className="parsed-top-row">
                  <label>Title<input value={entry.title} onChange={(event) => updateParsedAssignment(entry.id, 'title', event.target.value)} /></label>
                  <label>Class name (optional)<input value={entry.courseName ?? ''} onChange={(event) => updateParsedAssignment(entry.id, 'courseName', event.target.value)} placeholder="e.g. BIO-101" /></label>
                  <button type="button" className="secondary-button" onClick={() => removeParsedAssignment(entry.id)}>Remove</button>
                </div>
                <div className="time-row">
                  <label>Due date<input type="date" value={entry.dueDate} onChange={(event) => updateParsedAssignment(entry.id, 'dueDate', event.target.value)} /></label>
                  <label>
                    Estimated work
                    <div className="mini-work-grid">
                      <input type="number" min={0} step={1} value={entry.workHours} onChange={(event) => updateParsedAssignment(entry.id, 'workHours', Number(event.target.value) || 0)} />
                      <span>hr</span>
                      <input type="number" min={0} max={59} step={1} value={entry.workMinutes} onChange={(event) => updateParsedAssignment(entry.id, 'workMinutes', Number(event.target.value) || 0)} />
                      <span>min</span>
                    </div>
                  </label>
                </div>
                <div className="source-text-box"><strong>Original source</strong><p>{entry.sourceText}</p></div>
                {entry.isMissingDate || entry.isAmbiguousDate ? <div className="warning-box">Missing or uncertain date — review before importing this assignment.</div> : null}
                <div className="parsed-actions"><button type="button" onClick={() => addParsedAssignment(entry)} disabled={!entry.dueDate}>Save to planner</button></div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function CalendarPage({ assignment, confirmedAssignments, commitments, sessions, cleanup, completedItems, onToggleComplete }: {
  confirmedAssignments: AssignmentSettings[]
  commitments: Commitment[]
  sessions: StudySession[]
  cleanup: React.ReactNode
  completedItems: Record<string, boolean>
  onToggleComplete: (item: CalendarItem, completed: boolean) => void
  assignment: AssignmentSettings
}) {
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const detailDialog = useRef<HTMLDialogElement>(null)
  const closeDetail = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (selectedItemId && !detailDialog.current?.open) {
      detailDialog.current?.showModal()
      closeDetail.current?.focus()
    }
  }, [selectedItemId])
  const [view, setView] = useState<'day' | 'week' | 'month'>('month')
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const rangeStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate())
  if (view === 'month') rangeStart.setDate(1)
  if (view === 'week') rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay())
  const rangeEnd = new Date(rangeStart)
  if (view === 'month') rangeEnd.setMonth(rangeEnd.getMonth() + 1)
  else rangeEnd.setDate(rangeEnd.getDate() + (view === 'week' ? 7 : 1))
  const days: Date[] = []
  for (const day = new Date(rangeStart); day < rangeEnd; day.setDate(day.getDate() + 1)) days.push(new Date(day))
  const moveDate = (direction: number) => {
    const next = new Date(calendarDate)
    if (view === 'month') { next.setDate(1); next.setMonth(next.getMonth() + direction) }
    else next.setDate(next.getDate() + direction * (view === 'week' ? 7 : 1))
    setCalendarDate(next)
    setSelectedItemId('')
  }


  const items = useMemo<CalendarItem[]>(() => {
    const includesActive = confirmedAssignments.some((item) => item.title === assignment.title && item.dueDate === assignment.dueDate && normalizeCourseName(item.courseName) === normalizeCourseName(assignment.courseName))
    const deadlines = hasActiveAssignment(assignment) && !includesActive ? [...confirmedAssignments, assignment] : confirmedAssignments
    const assignmentItems = deadlines.map((assignment) => ({
      id: JSON.stringify(['assignment', normalizeCourseName(assignment.courseName), assignment.title, assignment.dueDate]),
      title: assignment.title,
      date: assignment.dueDate,
      kind: 'assignment' as const,
      courseName: assignment.courseName,
      campusId: assignment.campusId,
      campusBuildingId: assignment.campusBuildingId,
      roomNumber: assignment.roomNumber,
    }))

    const commitmentItems = commitments.map((commitment) => ({
      id: commitment.id,
      title: commitment.title,
      date: commitment.date,
      kind: 'commitment' as const,
      courseName: commitment.courseName,
      start: `${commitment.date}T${commitment.start}`,
      end: `${commitment.date}T${commitment.end}`,
      campusId: commitment.campusId,
      campusBuildingId: commitment.campusBuildingId,
      roomNumber: commitment.roomNumber,
    }))

    const studyItems = sessions.map((session) => ({
      id: session.id,
      title: formatSessionAssignmentTitle(session.assignmentId),
      date: `${new Date(session.start).getFullYear()}-${String(new Date(session.start).getMonth() + 1).padStart(2, '0')}-${String(new Date(session.start).getDate()).padStart(2, '0')}`,
      kind: 'study' as const,
      courseName: assignment.courseName,
      start: session.start,
      end: session.end,
    }))

    return [...assignmentItems, ...commitmentItems, ...studyItems].sort((a, b) => {
      const leftStart = 'start' in a ? (a.start ?? '') : ''
      const rightStart = 'start' in b ? (b.start ?? '') : ''
      const left = `${a.date}-${leftStart}`
      const right = `${b.date}-${rightStart}`
      return left.localeCompare(right)
    })
  }, [assignment, commitments, confirmedAssignments, sessions])

  const isComplete = (item: CalendarItem) => item.kind === 'study'
    ? sessions.find((session) => session.id === item.id)?.status === 'completed'
    : completedItems[item.id] === true

  const visibleItems = items.filter((item) => item.date >= dateKey(rangeStart) && item.date < dateKey(rangeEnd))
  const selectedItem = visibleItems.find((item) => item.id === selectedItemId) ?? null

  return (
    <main className="page-content calendar-page">
      <section className="panel calendar-panel">
        <div className="calendar-toolbar">
        <div><p className="eyebrow">Your schedule</p><h2 aria-live="polite">{view === 'month' ? calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : view === 'day' ? formatDate(dateKey(rangeStart)) : `${formatDate(dateKey(rangeStart))} – ${formatDate(dateKey(days[days.length - 1]))}`}</h2></div>
        <div className="calendar-view-controls" role="group" aria-label="Calendar view">
          {(['day', 'week', 'month'] as const).map((mode) => <button key={mode} type="button" className="secondary-button" aria-pressed={view === mode} onClick={() => { setView(mode); setSelectedItemId('') }}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}
        </div>
        <div className="calendar-period-controls">
          <button type="button" className="secondary-button" aria-label={`Previous ${view}`} onClick={() => moveDate(-1)}>Previous</button>
          <button type="button" className="secondary-button" onClick={() => { setCalendarDate(new Date()); setSelectedItemId('') }}>Today</button>
          <button type="button" className="secondary-button" aria-label={`Next ${view}`} onClick={() => moveDate(1)}>Next</button>
        </div>
        <label className="calendar-jump">Go to date<input type="date" value={dateKey(calendarDate)} onChange={(event) => { if (event.target.value) { setCalendarDate(new Date(`${event.target.value}T12:00:00`)); setSelectedItemId('') } }} /></label>
        </div>
        <p className="workflow-help">Select an event for details or to mark it done. Select a date to open its day.</p>
        <div className="calendar-legend" aria-label="Event types"><span className="calendar-event-label assignment">Deadline</span><span className="calendar-event-label study">Study</span><span className="calendar-event-label commitment">Busy time</span></div>
        {view !== 'day' ? <div className={`calendar-date-grid ${view}`}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="calendar-weekday" aria-hidden="true">{day}</span>)}
          {view === 'month' ? Array.from({ length: rangeStart.getDay() }, (_, index) => <span key={`blank-${index}`} />) : null}
          {days.map((day) => {
            const key = dateKey(day)
            const dayItems = items.filter((item) => item.date === key)
            const shownItems = view === 'month' ? dayItems.slice(0, 2) : dayItems
            return <div key={key} className={`calendar-date-cell${key === dateKey(new Date()) ? ' is-today' : ''}`}>
              <button type="button" className="calendar-cell-date" aria-label={`${formatDate(key)}, ${dayItems.length} items. Open day`} onClick={() => { setCalendarDate(day); setView('day'); setSelectedItemId('') }}><span className="calendar-cell-weekday">{day.toLocaleDateString(undefined, { weekday: 'short' })} </span>{day.getDate()}</button>
              {view === 'month' && dayItems.length > 0 ? <button type="button" className="calendar-mobile-count" aria-label={`${dayItems.length} events on ${formatDate(key)}. Open day`} onClick={() => { setCalendarDate(day); setView('day') }}>{dayItems.length} <span>{dayItems.length === 1 ? 'event' : 'events'}</span></button> : null}
              {shownItems.map((item) => <button key={item.id} type="button" className={`calendar-cell-event ${item.kind}${isComplete(item) ? ' completed' : ''}`} onClick={() => setSelectedItemId(item.id)} title={`${item.title} · ${item.start ? formatTime(new Date(item.start)) : 'Due'}${isComplete(item) ? ' · Completed' : ''}`}>
                <span>{item.start ? formatTime(new Date(item.start)) : 'Due'}{isComplete(item) ? ' · Done' : ''}</span><strong>{item.title}</strong>
              </button>)}
              {view === 'month' && dayItems.length > 2 ? <button type="button" className="calendar-more-events" onClick={() => { setCalendarDate(day); setView('day') }}>+{dayItems.length - 2} more</button> : null}
              {view === 'week' && dayItems.length === 0 ? <small className="calendar-cell-empty">No events</small> : null}
            </div>
          })}
        </div> : null}

        {visibleItems.length === 0 ? <p className="empty-state">No items scheduled for this {view}.</p> : null}
        {view === 'day' ? <ul className="calendar-detail-list">
          {visibleItems.map((item) => (
            <li key={item.id} className={`calendar-detail-item${selectedItemId === item.id ? ' selected' : ''}${isComplete(item) ? ' completed' : ''}`}>
              <label className="calendar-check-target">
                <input
                  type="checkbox"
                  checked={isComplete(item)}
                  onChange={(event) => onToggleComplete(item, event.target.checked)}
                  aria-label={`Mark ${item.title} (${formatDate(item.date)}${item.start ? `, ${formatTime(new Date(item.start))}` : ''}) ${isComplete(item) ? 'incomplete' : 'complete'}`}
                />
              </label>
              <button type="button" className="detail-item-button" onClick={() => setSelectedItemId(item.id)}>
                <span className="calendar-item-time">{item.start ? formatTime(new Date(item.start)) : 'All day'}</span>
                <span className="detail-item-main">
                  <span className={`calendar-pill ${item.kind}`}>{item.kind === 'assignment' ? 'Deadline' : item.kind === 'study' ? 'Study' : 'Commitment'}</span>
                  <strong>{item.title}</strong>
                  {isComplete(item) ? <span className="calendar-completed-label">Completed</span> : null}
                  <small>{item.courseName ? `${item.courseName} · ` : ''}{formatDate(item.date)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul> : null}
      </section>
      <details className="calendar-manage"><summary>Manage calendar &amp; clear a class</summary>{cleanup}</details>
      <dialog ref={detailDialog} className="calendar-event-dialog" aria-labelledby="calendar-event-title" onCancel={() => setSelectedItemId('')} onClose={() => setSelectedItemId('')}>
        {selectedItem ? (
          <>
            <div className="calendar-dialog-heading"><h2 id="calendar-event-title">Event details</h2><button type="button" className="secondary-button" ref={closeDetail} onClick={() => detailDialog.current?.close()}>Close</button></div>
            <div className="calendar-detail-head">
              <span className={`calendar-pill ${selectedItem.kind}`}>{selectedItem.kind === 'assignment' ? 'Deadline' : selectedItem.kind === 'study' ? 'Study' : 'Commitment'}</span>
              <strong>{selectedItem.title}</strong>
            </div>
            <div className="calendar-detail-meta">
              <span>{formatDate(selectedItem.date)}</span>
              {selectedItem.start ? <span>{formatTime(new Date(selectedItem.start))}{selectedItem.end ? `–${formatTime(new Date(selectedItem.end))}` : ''}</span> : null}
              {formatLocationText(selectedItem.campusId, selectedItem.campusBuildingId, selectedItem.roomNumber) ? <span>{formatLocationText(selectedItem.campusId, selectedItem.campusBuildingId, selectedItem.roomNumber)}</span> : null}
            </div>
            <label className="planner-session-check"><input type="checkbox" checked={isComplete(selectedItem)} onChange={(event) => onToggleComplete(selectedItem, event.target.checked)} />Completed</label>
            {getLocationSummary(selectedItem.campusId, selectedItem.campusBuildingId, selectedItem.roomNumber) ? (
              <div className="calendar-detail-actions">
                <a className="primary-link-button" href={buildCampusMapPath(selectedItem.campusId ?? DEFAULT_CAMPUS_ID, selectedItem.campusBuildingId, selectedItem.roomNumber)}>Find my class</a>
              </div>
            ) : null}
          </>
        ) : null}
      </dialog>
    </main>
  )
}

function MySchedulePage(props: PlannerProps) {
  const { commitments, sessions, updateSessionStatus, rescheduleUnfinished, setDraftCommitment, draftCommitment, addCommitment, removeCommitment } = props

  return (
    <main className="page-content">
      <section className="panel">
        <div className="panel-header-row"><div><p className="eyebrow">My Schedule</p><h2>Classes & busy times</h2></div></div>
        <p className="workflow-help">Add each class, work shift, or other busy time, then select Add busy time. Study sessions will fit around these times.</p>

        <div className="commitment-form">
          <label>Class or busy time<input value={draftCommitment.title} onChange={(event) => setDraftCommitment((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Class name (optional)<input value={draftCommitment.courseName ?? ''} onChange={(event) => setDraftCommitment((current) => ({ ...current, courseName: event.target.value }))} placeholder="Leave blank for work or clubs" /></label>
          <label>Date<input type="date" value={draftCommitment.date} onChange={(event) => setDraftCommitment((current) => ({ ...current, date: event.target.value }))} /></label>
          <div className="time-row">
            <label>Start<input type="time" value={draftCommitment.start} onChange={(event) => setDraftCommitment((current) => ({ ...current, start: event.target.value }))} /></label>
            <label>End<input type="time" value={draftCommitment.end} onChange={(event) => setDraftCommitment((current) => ({ ...current, end: event.target.value }))} /></label>
          </div>
          <button type="button" onClick={addCommitment}>Add busy time</button>
        </div>

        <ul className="commitment-list">
          {commitments.map((commitment) => {
            const location = getLocationSummary(commitment.campusId, commitment.campusBuildingId, commitment.roomNumber)
            return (
              <li key={commitment.id} className="commitment-item">
                <div>
                  <strong>{commitment.title}</strong>
                  <p>{formatDate(commitment.date)} · {commitment.start}–{commitment.end}</p>
                  {location ? <p>{formatLocationText(commitment.campusId, commitment.campusBuildingId, commitment.roomNumber)}</p> : null}
                </div>
                <div className="campus-actions">
                  {location ? <a className="secondary-button" href={buildCampusMapPath(commitment.campusId ?? DEFAULT_CAMPUS_ID, commitment.campusBuildingId, commitment.roomNumber)}>Find my class</a> : null}
                  <button type="button" className="secondary-button" onClick={() => removeCommitment(commitment.id)}>Remove</button>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="getting-started-actions">
          <NavLink className="getting-started-primary" to="/calendar">Next: see my study plan</NavLink>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header-row"><div><p className="eyebrow">Session tracking</p><h2>Current study blocks</h2></div><button type="button" onClick={rescheduleUnfinished}>Reschedule unfinished work</button></div>
        <ul className="session-list">
          {sessions.length === 0 ? <li className="empty-state">No study blocks fit right now.</li> : sessions.map((session) => (
            <li key={session.id} className="session-item">
              <div className="session-meta"><strong>{formatSessionAssignmentTitle(session.assignmentId)}</strong><span>{formatDate(session.start.slice(0, 10))} • {formatTime(new Date(session.start))}–{formatTime(new Date(session.end))}</span><span className="session-current-status">Current status: {session.status === 'completed' ? 'Completed' : session.status === 'missed' ? 'Missed' : 'Planned'}</span></div>
              <div className="session-controls" role="group" aria-label="Session status">
                <button type="button" aria-pressed={session.status === 'completed'} className={session.status === 'completed' ? 'status active' : 'status'} onClick={() => updateSessionStatus(session.id, 'completed')}>Complete</button>
                <button type="button" aria-pressed={session.status === 'missed'} className={session.status === 'missed' ? 'status active warn' : 'status warn'} onClick={() => updateSessionStatus(session.id, 'missed')}>Missed</button>
                <button type="button" aria-pressed={session.status === 'planned'} className={session.status === 'planned' ? 'status active neutral' : 'status neutral'} onClick={() => updateSessionStatus(session.id, 'planned')}>Planned</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

function MorePage(props: PlannerProps) {
  const { commitments, sessions, updateSessionStatus, rescheduleUnfinished, setDraftCommitment, draftCommitment, addCommitment, removeCommitment } = props

  return (
    <main className="page-content">
      <section className="panel mobile-section">
        <div className="mobile-page-header"><div><p className="eyebrow">More</p><h2>Quick actions</h2></div></div>
        <div className="mobile-actions-stack">
          <NavLink to="/planner" className="mobile-link-card"><span className="nav-icon" aria-hidden="true">🧭</span><div><strong>Planner</strong><small>Adjust study blocks and timing</small></div></NavLink>
          <NavLink to="/schedule" className="mobile-link-card"><span className="nav-icon" aria-hidden="true">🗓️</span><div><strong>My Schedule</strong><small>Review commitments and session status</small></div></NavLink>
          <NavLink to="/campus-map" className="mobile-link-card"><span className="nav-icon" aria-hidden="true">🗺️</span><div><strong>Campus Map</strong><small>Campus building directory and walking directions</small></div></NavLink>
          <NavLink to="/settings" className="mobile-link-card"><span className="nav-icon" aria-hidden="true">⚙️</span><div><strong>Settings</strong><small>Choose college, campus, and appearance</small></div></NavLink>
        </div>
      </section>

      <section className="panel mobile-section">
        <div className="mobile-page-header"><div><p className="eyebrow">Schedule</p><h2>Commitments</h2></div><button type="button" className="secondary-button" onClick={rescheduleUnfinished}>Reschedule</button></div>

        <div className="commitment-form compact-form">
          <label>Class or busy time<input value={draftCommitment.title} onChange={(event) => setDraftCommitment((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Class name (optional)<input value={draftCommitment.courseName ?? ''} onChange={(event) => setDraftCommitment((current) => ({ ...current, courseName: event.target.value }))} placeholder="Leave blank for work or clubs" /></label>
          <label>Date<input type="date" value={draftCommitment.date} onChange={(event) => setDraftCommitment((current) => ({ ...current, date: event.target.value }))} /></label>
          <div className="time-row"><label>Start<input type="time" value={draftCommitment.start} onChange={(event) => setDraftCommitment((current) => ({ ...current, start: event.target.value }))} /></label><label>End<input type="time" value={draftCommitment.end} onChange={(event) => setDraftCommitment((current) => ({ ...current, end: event.target.value }))} /></label></div>
          <button type="button" onClick={addCommitment}>Add busy time</button>
        </div>

        <ul className="commitment-list">
          {commitments.length === 0 ? <li className="empty-state">No commitments yet.</li> : commitments.map((commitment) => {
            const location = getLocationSummary(commitment.campusId, commitment.campusBuildingId, commitment.roomNumber)
            return (
              <li key={commitment.id} className="commitment-item">
                <div>
                  <strong>{commitment.title}</strong>
                  <p>{formatDate(commitment.date)} · {commitment.start}–{commitment.end}</p>
                  {location ? <p>{formatLocationText(commitment.campusId, commitment.campusBuildingId, commitment.roomNumber)}</p> : null}
                </div>
                <div className="campus-actions">
                  {location ? <a className="secondary-button" href={buildCampusMapPath(commitment.campusId ?? DEFAULT_CAMPUS_ID, commitment.campusBuildingId, commitment.roomNumber)}>Find my class</a> : null}
                  <button type="button" className="secondary-button" onClick={() => removeCommitment(commitment.id)}>Remove</button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="panel mobile-section">
        <div className="mobile-page-header"><div><p className="eyebrow">Study blocks</p><h2>Session tracking</h2></div></div>
        {sessions.length === 0 ? <div className="empty-state">No study blocks match your current schedule.</div> : (
          <ul className="session-list">
            {sessions.map((session) => (
              <li key={session.id} className="session-item">
                <div className="session-meta"><strong>{formatSessionAssignmentTitle(session.assignmentId)}</strong><span>{formatDate(session.start.slice(0, 10))} • {formatTime(new Date(session.start))}–{formatTime(new Date(session.end))}</span><span className="session-current-status">Current status: {session.status === 'completed' ? 'Completed' : session.status === 'missed' ? 'Missed' : 'Planned'}</span></div>
                <div className="session-controls" role="group" aria-label="Session status">
                  <button type="button" aria-pressed={session.status === 'completed'} className={session.status === 'completed' ? 'status active' : 'status'} onClick={() => updateSessionStatus(session.id, 'completed')}>Complete</button>
                  <button type="button" aria-pressed={session.status === 'missed'} className={session.status === 'missed' ? 'status active warn' : 'status warn'} onClick={() => updateSessionStatus(session.id, 'missed')}>Missed</button>
                  <button type="button" aria-pressed={session.status === 'planned'} className={session.status === 'planned' ? 'status active neutral' : 'status neutral'} onClick={() => updateSessionStatus(session.id, 'planned')}>Planned</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function CampusMapViewport({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  const [latitude, longitude] = center
  useEffect(() => {
    map.setView([latitude, longitude], zoom)
  }, [map, latitude, longitude, zoom])
  return null
}

function CampusMapInteraction({ touchInteractionEnabled }: { touchInteractionEnabled: boolean }) {
  const map = useMap()

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const updateInteraction = () => {
      if (!coarsePointer.matches || touchInteractionEnabled) {
        map.dragging.enable()
        map.touchZoom.enable()
      } else {
        map.dragging.disable()
        map.touchZoom.disable()
      }
    }

    updateInteraction()
    coarsePointer.addEventListener('change', updateInteraction)
    return () => coarsePointer.removeEventListener('change', updateInteraction)
  }, [map, touchInteractionEnabled])

  return null
}

function CampusMapPage({
  selectedCampusId,
  confirmedAssignments,
  commitments,
}: {
  selectedCampusId: string
  confirmedAssignments: AssignmentSettings[]
  commitments: Commitment[]
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramCampusId = searchParams.get('campus')
  const campusId = paramCampusId ? getCampusById(paramCampusId).id : selectedCampusId
  const selectedCampus = getCampusById(campusId)

  const [campusSearch, setCampusSearch] = useState('')
  const [search, setSearch] = useState('')
  const [showMyClasses, setShowMyClasses] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationMessage, setLocationMessage] = useState('')
  const [geocodedCenter, setGeocodedCenter] = useState<[number, number] | null>(null)
  const [customDestination, setCustomDestination] = useState('')
  const [touchInteractionEnabled, setTouchInteractionEnabled] = useState(true)

  const requestedBuildingId = searchParams.get('building') ?? ''
  const roomNumber = searchParams.get('room') ?? ''
  const selectedBuildingId = requestedBuildingId && getLocationSelectOptions(campusId).some((building) => building.id === requestedBuildingId)
    ? requestedBuildingId
    : ''

  const updateMapParams = (updates: { campusId?: string; buildingId?: string; room?: string }) => {
    const next = new URLSearchParams(searchParams)
    const nextCampusId = updates.campusId ?? campusId
    next.set('campus', nextCampusId)

    if (updates.buildingId !== undefined) {
      if (updates.buildingId) next.set('building', updates.buildingId)
      else next.delete('building')
    }

    if (updates.room !== undefined) {
      if (updates.room.trim()) next.set('room', updates.room)
      else next.delete('room')
    }

    setSearchParams(next, { replace: true })
  }

  const filteredCampuses = useMemo(() => {
    const term = campusSearch.trim().toLowerCase()
    if (!term) return CAMPUS_CONFIGS
    return CAMPUS_CONFIGS.filter((campus) => {
      const text = `${campus.universityName} ${campus.campusName} ${campus.city} ${campus.state}`.toLowerCase()
      return text.includes(term)
    })
  }, [campusSearch])

  useEffect(() => {
    if (selectedCampus.centerLatitude !== undefined && selectedCampus.centerLongitude !== undefined) {
      return
    }

    let canceled = false
    const controller = new AbortController()
    const query = encodeURIComponent(selectedCampus.fallbackDestination)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`, {
      method: 'GET',
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<Array<{ lat: string; lon: string }>>)
      .then((results) => {
        if (canceled || !results[0]) return
        const lat = Number(results[0].lat)
        const lon = Number(results[0].lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setGeocodedCenter([lat, lon])
        }
      })
      .catch(() => {
        if (!canceled) setGeocodedCenter([39.8283, -98.5795])
      })

    return () => {
      canceled = true
      controller.abort()
    }
  }, [selectedCampus.centerLatitude, selectedCampus.centerLongitude, selectedCampus.fallbackDestination])

  const allBuildings = selectedCampus.buildings
  const mappableBuildings = allBuildings.filter(hasValidCoordinates)

  const myClassBuildingIds = useMemo(() => {
    const assignmentIds = confirmedAssignments
      .filter((entry) => (entry.campusId ?? selectedCampusId) === campusId && entry.campusBuildingId)
      .map((entry) => entry.campusBuildingId as string)
    const commitmentIds = commitments
      .filter((entry) => (entry.campusId ?? selectedCampusId) === campusId && entry.campusBuildingId)
      .map((entry) => entry.campusBuildingId as string)
    return new Set([...assignmentIds, ...commitmentIds])
  }, [campusId, commitments, confirmedAssignments, selectedCampusId])

  const filteredBuildings = allBuildings.filter((building) => {
    const term = search.trim().toLowerCase()
    const textMatch = !term || building.name.toLowerCase().includes(term) || building.shortName.toLowerCase().includes(term) || toAddressLine(building).toLowerCase().includes(term)
    const classMatch = !showMyClasses || myClassBuildingIds.has(building.id)
    return textMatch && classMatch
  })

  const findFirstMatchingBuildingId = (term: string, onlyMyClasses: boolean): string => {
    const normalizedTerm = term.trim().toLowerCase()
    const firstMatch = allBuildings.find((building) => {
      const textMatch = !normalizedTerm
        || building.name.toLowerCase().includes(normalizedTerm)
        || building.shortName.toLowerCase().includes(normalizedTerm)
        || toAddressLine(building).toLowerCase().includes(normalizedTerm)
      const classMatch = !onlyMyClasses || myClassBuildingIds.has(building.id)
      return textMatch && classMatch
    })
    return firstMatch?.id ?? ''
  }

  const filteredMappableBuildings = mappableBuildings.filter((building) => filteredBuildings.some((entry) => entry.id === building.id))
  const selectedBuilding = allBuildings.find((building) => building.id === selectedBuildingId) ?? filteredBuildings[0] ?? allBuildings[0]

  const mapCenter: [number, number] = selectedBuilding && hasValidCoordinates(selectedBuilding)
    ? [selectedBuilding.latitude, selectedBuilding.longitude]
    : geocodedCenter ?? [39.8283, -98.5795]

  const selectedDirectionsLink = selectedBuilding ? buildCampusDirectionsUrl(campusId, selectedBuilding.id, roomNumber) : buildCampusDirectionsUrl(campusId, undefined, roomNumber)
  const customDirectionsLink = customDestination.trim()
    ? buildGoogleMapsWalkingUrl(`${customDestination.trim()}, ${selectedCampus.universityName}, ${selectedCampus.city}, ${selectedCampus.state}`)
    : ''
  const directionsLink = customDirectionsLink || selectedDirectionsLink

  const openBuildingDirections = (buildingId: string) => {
    updateMapParams({ buildingId })
    const url = buildCampusDirectionsUrl(campusId, buildingId, roomNumber)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location access is not available in this browser.')
      return
    }

    setLocationMessage('Getting your location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setLocationMessage('Location added to map.')
      },
      () => {
        setLocationMessage('Location access was denied. You can still search and use building directions.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <main className="page-content campus-page map-heavy-page">
      <section className="panel campus-panel campus-map-main">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">{selectedCampus.universityName} · {selectedCampus.campusName}</p>
            <h2>Campus map</h2>
          </div>
          <a href={selectedCampus.officialMapUrl} target="_blank" rel="noreferrer" className="official-campus-link">Official campus map</a>
        </div>

        <div className="campus-toolbar">
          <label className="campus-search">Choose campus
            <input value={campusSearch} onChange={(event) => setCampusSearch(event.target.value)} placeholder="Search university or campus" />
          </label>
          <label className="campus-search">Campus
            <select
              value={campusId}
              onChange={(event) => {
                const nextCampusId = event.target.value
                updateMapParams({ campusId: nextCampusId, buildingId: '', room: '' })
                setSearch('')
                setShowMyClasses(false)
                setCustomDestination('')
                setUserLocation(null)
                setLocationMessage('')
              }}
            >
              {filteredCampuses.map((campus) => (
                <option key={campus.id} value={campus.id}>{getCampusLabel(campus)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="campus-toolbar">
          <label className="campus-search">Search building
            <input
              value={search}
              onChange={(event) => {
                const nextSearch = event.target.value
                setSearch(nextSearch)
                const nextBuildingId = findFirstMatchingBuildingId(nextSearch, showMyClasses)
                updateMapParams({ buildingId: nextBuildingId })
              }}
              placeholder="Search listed buildings or addresses"
            />
          </label>
          <button
            type="button"
            className={showMyClasses ? 'secondary-button active-filter' : 'secondary-button'}
            onClick={() => {
              const nextShowMyClasses = !showMyClasses
              setShowMyClasses(nextShowMyClasses)
              const nextBuildingId = findFirstMatchingBuildingId(search, nextShowMyClasses)
              updateMapParams({ buildingId: nextBuildingId })
            }}
          >
            My classes
          </button>
          <button type="button" className="secondary-button" onClick={requestLocation}>Use my location</button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearch('')
              setShowMyClasses(false)
              setCustomDestination('')
              setUserLocation(null)
              setLocationMessage('')
              updateMapParams({ buildingId: '', room: '' })
            }}
          >
            Clear filters
          </button>
          <span className="campus-status-chip">Showing {filteredBuildings.length} building{filteredBuildings.length === 1 ? '' : 's'}</span>
        </div>
        {locationMessage ? <p className="field-hint">{locationMessage}</p> : null}
        {selectedCampus.buildingCoverage === 'partial' ? <p className="field-hint">Building coverage is partial for this campus. Use the official campus map for complete listings.</p> : null}

        <div className="campus-map-touch-controls">
          <button
            type="button"
            className="secondary-button"
            aria-pressed={touchInteractionEnabled}
            onClick={() => setTouchInteractionEnabled((current) => !current)}
          >
            {touchInteractionEnabled ? 'Scroll page' : 'Move map'}
          </button>
          <p>{touchInteractionEnabled ? 'Drag to move the map. Tap Scroll page when finished.' : 'Swipe to scroll the page. Tap Move map to pan.'}</p>
        </div>
        <div className={`campus-map-canvas${touchInteractionEnabled ? ' map-interactive' : ''}`}>
          <MapContainer center={mapCenter} zoom={selectedBuilding && hasValidCoordinates(selectedBuilding) ? 16 : 14} scrollWheelZoom={false} attributionControl={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CampusMapViewport center={mapCenter} zoom={selectedBuilding && hasValidCoordinates(selectedBuilding) ? 16 : 14} />
            <CampusMapInteraction touchInteractionEnabled={touchInteractionEnabled} />

            {filteredMappableBuildings.map((building) => {
              const isSelected = selectedBuilding?.id === building.id
              const isClassBuilding = myClassBuildingIds.has(building.id)
              return (
                <CircleMarker
                  key={building.id}
                  center={[building.latitude, building.longitude]}
                  radius={isSelected ? 10 : 7}
                  pathOptions={{
                    color: isSelected ? '#ef4444' : isClassBuilding ? '#2563eb' : '#14532d',
                    fillColor: isSelected ? '#f87171' : isClassBuilding ? '#60a5fa' : '#34d399',
                    fillOpacity: 0.8,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{ click: () => openBuildingDirections(building.id) }}
                >
                  <Popup>
                    <strong>{building.name}</strong>
                    <p>{toAddressLine(building)}</p>
                    <a href={buildCampusDirectionsUrl(campusId, building.id, roomNumber)} target="_blank" rel="noreferrer">Open walking directions</a>
                  </Popup>
                </CircleMarker>
              )
            })}

            {userLocation ? (
              <CircleMarker center={userLocation} radius={8} pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.9, weight: 2 }}>
                <Popup>Your location</Popup>
              </CircleMarker>
            ) : null}
          </MapContainer>
        </div>

        <div className="campus-directory-list">
          {filteredBuildings.length > 0 ? (
            filteredBuildings.map((building) => {
              const active = selectedBuilding?.id === building.id
              return (
                <div key={building.id} className={active ? 'campus-directory-item active' : 'campus-directory-item'}>
                  <button type="button" className="campus-directory-name" onClick={() => openBuildingDirections(building.id)}>{building.name}</button>
                  <div className="campus-directory-meta"><span>{building.shortName}</span><span>{toAddressLine(building)}</span></div>
                </div>
              )
            })
          ) : (
            <div className="empty-state">{allBuildings.length === 0 ? 'The campus map is available, but building listings have not been added yet. Explore by dragging the map, search an address below, or open the official campus map.' : 'No buildings match these filters. Clear filters or open the official campus map.'}</div>
          )}
        </div>
      </section>

      <section className="panel campus-detail-panel">
        <details className="campus-mobile-details" open>
          <summary>Building details</summary>
          <div className="campus-detail-wrap">
            <div className="panel-header-row"><div><p className="eyebrow">Selected building</p><h2>{selectedBuilding?.name ?? 'No building selected'}</h2></div></div>
            <div className="campus-detail-meta">
              <span>{selectedBuilding?.shortName ?? 'Campus marker'}</span>
              <span>{selectedBuilding ? toAddressLine(selectedBuilding) : selectedCampus.fallbackDestination}</span>
            </div>
            <div className="campus-route-box">
              <strong>Walking directions</strong>
              <p>{selectedBuilding?.name ?? selectedCampus.campusName}</p>
              <small>Directions open Google Maps for walking. This app does not provide indoor routing.</small>
            </div>

            <div className="campus-room-box">
              <span className="field-label">Room number</span>
              <input value={roomNumber} onChange={(event) => updateMapParams({ room: event.target.value })} placeholder="e.g. 101" aria-label="Room number" />
              <small className="field-hint">{selectedBuilding ? formatLocationText(campusId, selectedBuilding.id, roomNumber) : 'No room added yet — directions still lead to the building.'}</small>
            </div>

            <div className="campus-room-box">
              <span className="field-label">Custom building or address</span>
              <input
                value={customDestination}
                onChange={(event) => setCustomDestination(event.target.value)}
                placeholder="Type a building name or address"
                aria-label="Custom building or address"
              />
              <small className="field-hint">Use this when a campus has partial building coverage. If filled, walking directions use this destination.</small>
            </div>

            <div className="campus-actions">
              <a href={directionsLink} target="_blank" rel="noreferrer" className="primary-link-button">Open walking directions</a>
              <a href={selectedCampus.officialMapUrl} target="_blank" rel="noreferrer" className="secondary-button campus-official-link">Official map</a>
            </div>
          </div>
        </details>
      </section>
    </main>
  )
}

function SettingsPage({
  selectedThemeId,
  onCollegeChange,
  selectedTheme,
  selectedCampusId,
  onCampusChange,
  isDark,
  setIsDark,
  settingsSavedMessage,
}: {
  selectedThemeId: SchoolThemeId
  onCollegeChange: (nextThemeId: SchoolThemeId) => void
  selectedTheme: SchoolTheme
  selectedCampusId: string
  onCampusChange: (nextCampusId: string) => void
  isDark: boolean
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>
  settingsSavedMessage: string
}) {
  const [collegeSearch, setCollegeSearch] = useState('')
  const [campusSearch, setCampusSearch] = useState('')

  const filteredColleges = SCHOOL_THEMES.filter((theme) => {
    const term = collegeSearch.trim().toLowerCase()
    if (!term) return true
    return theme.name.toLowerCase().includes(term)
  })

  const collegeCampuses = getCampusesForCollege(selectedThemeId)
  const filteredCampuses = collegeCampuses.filter((campus) => {
    const term = campusSearch.trim().toLowerCase()
    if (!term) return true
    return getCampusLabel(campus).toLowerCase().includes(term) || campus.city.toLowerCase().includes(term) || campus.state.toLowerCase().includes(term)
  })
  const hasMultipleCampuses = collegeCampuses.length > 1
  const campusSelectOptions = hasMultipleCampuses && filteredCampuses.length > 0 ? filteredCampuses : collegeCampuses

  return (
    <main className="page-content">
      <section className="panel">
        <div className="panel-header-row"><div><p className="eyebrow">Settings</p><h2>College, campus, and appearance</h2></div></div>

        <div className="appearance-block">
          <label className="field-label" htmlFor="college-search">Your college</label>
          <input id="college-search" value={collegeSearch} onChange={(event) => setCollegeSearch(event.target.value)} placeholder="Search college" />

          <label className="field-label" htmlFor="college-select">College</label>
          <select id="college-select" value={selectedThemeId} onChange={(event) => onCollegeChange(event.target.value as SchoolThemeId)}>
            {filteredColleges.map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
          </select>

          {hasMultipleCampuses ? <label className="field-label" htmlFor="campus-search">Your campus</label> : null}
          {hasMultipleCampuses ? <input id="campus-search" value={campusSearch} onChange={(event) => setCampusSearch(event.target.value)} placeholder="Search campus" /> : null}

          <label className="field-label" htmlFor="campus-select">Campus</label>
          <select id="campus-select" value={selectedCampusId} onChange={(event) => onCampusChange(event.target.value)}>
            {campusSelectOptions.map((campus) => (
              <option key={campus.id} value={campus.id}>{getCampusLabel(campus)}</option>
            ))}
          </select>

          <p className="field-hint campus-selected-name">{collegeCampuses.filter((campus) => campus.id === selectedCampusId).map((campus) => getCampusLabel(campus)).join('')}</p>
          <label className="field-label" htmlFor="appearance-toggle">Appearance</label>
          <button id="appearance-toggle" type="button" className="secondary-button" onClick={() => setIsDark((current) => !current)}>
            {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          </button>

          <div className="theme-preview" aria-hidden="true"><span style={{ background: selectedTheme.primary }} /><span style={{ background: selectedTheme.secondary }} /></div>
          {settingsSavedMessage ? <p className="status-message success">{settingsSavedMessage}</p> : null}
        </div>
      </section>
    </main>
  )
}

function AppContent() {
  const appShellRef = useRef<HTMLDivElement>(null)
  const mobileNavRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const shell = appShellRef.current
    const nav = mobileNavRef.current
    if (!shell || !nav) return

    const updateNavHeight = () => {
      const height = nav.getBoundingClientRect().height
      if (height > 0) shell.style.setProperty('--mobile-nav-height', `${Math.ceil(height)}px`)
    }

    updateNavHeight()
    const observer = new ResizeObserver(updateNavHeight)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [])

  const [assignment, setAssignment] = useState<AssignmentSettings>(() => {
    const saved = readStoredJson<AssignmentSettings | null>(ASSIGNMENT_STORAGE_KEY, null)
    if (!saved) return initialAssignment
    return {
      ...initialAssignment,
      ...saved,
      studyDays: Array.isArray(saved.studyDays) && saved.studyDays.length > 0 ? saved.studyDays : initialAssignment.studyDays,
    }
  })
  const [commitments, setCommitments] = useState<Commitment[]>(() => readStoredJson<Commitment[]>(COMMITMENTS_STORAGE_KEY, initialCommitments))
  const [draftCommitment, setDraftCommitment] = useState<DraftCommitment>({
    title: 'Work Shift',
    date: '2026-10-25',
    start: '12:00',
    end: '15:00',
    campusId: DEFAULT_CAMPUS_ID,
    campusBuildingId: '',
    roomNumber: '',
  })
  const [sylInput, setSylInput] = useState(sampleSyllabus)
  const [parsedAssignments, setParsedAssignments] = useState<ParsedAssignment[]>(() => extractAssignmentsFromText(sampleSyllabus))
  const [selectedFileName, setSelectedFileName] = useState('')
  const [readStatus, setReadStatus] = useState<ReadStatus>({ kind: 'info', message: 'Paste a syllabus or upload a PDF or .txt file to get started.' })
  const [importStatus, setImportStatus] = useState<ReadStatus>({ kind: 'idle', message: '' })
  const [confirmedAssignments, setConfirmedAssignments] = useState<AssignmentSettings[]>(() => {
    const saved = readStoredJson<AssignmentSettings[]>(CONFIRMED_ASSIGNMENTS_STORAGE_KEY, [initialAssignment])
    return Array.isArray(saved) ? saved : [initialAssignment]
  })
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
  const [selectedCampusId, setSelectedCampusId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_CAMPUS_ID
    const saved = window.localStorage.getItem(SELECTED_CAMPUS_STORAGE_KEY)
    return getCampusById(saved).id
  })
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('')
  const mountedSettingsRef = useRef(false)
  const [now] = useState(() => new Date())
  const [workInput, setWorkInput] = useState<WorkInput>(() => hoursAndMinutesFromTotal(assignment.totalWorkMinutes))
  const [sessionStatusMap, setSessionStatusMap] = useState<Record<string, StudySession['status']>>(() => readStoredJson(SESSION_STATUS_STORAGE_KEY, {}))
  const [completedCalendarItems, setCompletedCalendarItems] = useState<Record<string, boolean>>(() => readStoredJson(CALENDAR_COMPLETION_STORAGE_KEY, {}))

  useEffect(() => {
    window.localStorage.setItem(CALENDAR_COMPLETION_STORAGE_KEY, JSON.stringify(completedCalendarItems))
  }, [completedCalendarItems])

  useEffect(() => {
    window.localStorage.setItem(SESSION_STATUS_STORAGE_KEY, JSON.stringify(sessionStatusMap))
  }, [sessionStatusMap])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const latestExtractedTextRef = useRef('')
  const latestExtractedKindRef = useRef<'txt' | 'pdf' | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(SCHOOL_THEME_STORAGE_KEY, selectedThemeId)
  }, [selectedThemeId])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDark))
  }, [isDark])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(SELECTED_CAMPUS_STORAGE_KEY, selectedCampusId)
  }, [selectedCampusId])

  useEffect(() => {
    if (!mountedSettingsRef.current) {
      mountedSettingsRef.current = true
      return
    }
    setSettingsSavedMessage('Saved settings')
    const timeoutId = window.setTimeout(() => setSettingsSavedMessage(''), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [selectedThemeId, selectedCampusId, isDark])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignment))
  }, [assignment])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(CONFIRMED_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(confirmedAssignments))
  }, [confirmedAssignments])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(COMMITMENTS_STORAGE_KEY, JSON.stringify(commitments))
  }, [commitments])

  const applyCampusDefaults = (nextCampusId: string) => {
    setSelectedCampusId(nextCampusId)
    const campusBuildings = getLocationSelectOptions(nextCampusId)

    setAssignment((current) => ({
      ...current,
      campusId: nextCampusId,
      campusBuildingId: campusBuildings.some((building) => building.id === current.campusBuildingId) ? current.campusBuildingId : '',
    }))

    setDraftCommitment((current) => ({
      ...current,
      campusId: nextCampusId,
      campusBuildingId: campusBuildings.some((building) => building.id === current.campusBuildingId) ? current.campusBuildingId : '',
    }))
  }

  const handleCollegeChange = (nextThemeId: SchoolThemeId) => {
    setSelectedThemeId(nextThemeId)
    const campusesForCollege = getCampusesForCollege(nextThemeId)
    const nextCampusId = campusesForCollege.some((campus) => campus.id === selectedCampusId)
      ? selectedCampusId
      : (campusesForCollege[0]?.id ?? DEFAULT_CAMPUS_ID)
    applyCampusDefaults(nextCampusId)
  }

  const handleCampusChange = (nextCampusId: string) => {
    applyCampusDefaults(nextCampusId)
  }

  const selectedTheme = useMemo(() => getSchoolThemeById(selectedThemeId), [selectedThemeId])
  const appStyle = useMemo(() => {
    const isMichigan = selectedTheme.id === 'michigan'
    return {
      ['--theme-primary' as string]: selectedTheme.primary,
      ['--theme-primary-strong' as string]: selectedTheme.primaryStrong,
      ['--theme-primary-soft' as string]: selectedTheme.primarySoft,
      ['--theme-primary-text' as string]: selectedTheme.primaryText,
      ['--theme-secondary' as string]: selectedTheme.secondary,
      ['--theme-secondary-strong' as string]: selectedTheme.secondaryStrong,
      ['--theme-secondary-soft' as string]: selectedTheme.secondarySoft,
      ['--theme-secondary-text' as string]: selectedTheme.secondaryText,
      ['--theme-accent' as string]: selectedTheme.secondary,
      ['--theme-accent-strong' as string]: selectedTheme.secondaryStrong,
      ['--sidebar-bg' as string]: isMichigan ? selectedTheme.primary : selectedTheme.primaryStrong,
      ['--sidebar-text' as string]: selectedTheme.primaryText,
      ['--nav-active-bg' as string]: isMichigan ? selectedTheme.secondary : selectedTheme.primary,
      ['--nav-active-text' as string]: isMichigan ? selectedTheme.secondaryText : selectedTheme.primaryText,
      ['--button-primary-bg' as string]: selectedTheme.primary,
      ['--button-primary-text' as string]: selectedTheme.primaryText,
      ['--button-primary-hover' as string]: selectedTheme.primaryStrong,
      ['--button-secondary-bg' as string]: isDark ? '#1f2937' : '#f1f5f9',
      ['--button-secondary-text' as string]: isDark ? '#e2e8f0' : '#111827',
      ['--page-bg' as string]: isDark ? '#0b1220' : '#f3f5f7',
      ['--panel-bg' as string]: isDark ? '#111827' : '#ffffff',
      ['--panel-alt' as string]: isDark ? '#1a2433' : '#f8fafc',
      ['--panel-border' as string]: isDark ? '#2d3a4e' : '#dfe3ea',
      ['--text-color' as string]: isDark ? '#f8fafc' : '#111827',
      ['--muted-text' as string]: isDark ? '#cbd5e1' : '#475569',
      ['--field-bg' as string]: isDark ? '#0f172a' : '#ffffff',
      ['--field-border' as string]: isDark ? '#334155' : '#cbd5e1',
    }
  }, [isDark, selectedTheme])

  const totalWorkMinutes = useMemo(() => totalMinutesFromWorkInput(workInput), [workInput])
  const workTotalValid = totalWorkMinutes > 0
  const combinedPlan = useMemo(() => buildMultiAssignmentPlan(confirmedAssignments, commitments, now), [confirmedAssignments, commitments, now])
  const plan = useMemo(() => buildStudyPlan({ ...assignment, totalWorkMinutes }, commitments, now), [assignment, commitments, now, totalWorkMinutes])
  const sessions = useMemo(() => plan.sessions.map((session) => ({ ...session, status: sessionStatusMap[session.id] ?? session.status })), [plan.sessions, sessionStatusMap])
  const milestones = useMemo(() => buildMilestones(assignment.totalWorkMinutes), [assignment.totalWorkMinutes])
  const completedMinutes = sessions.filter((session) => session.status === 'completed').reduce((total) => total + assignment.sessionMinutes, 0)
  const unscheduledMinutes = Math.max(plan.remainingWorkMinutes, 0)

  const parseSyllabusText = (sourceText: string, sourceKind: 'txt' | 'pdf' = 'txt') => {
    return deduplicateImportedAssignments(sourceKind === 'pdf' ? extractAssignmentsFromPdfText(sourceText) : extractAssignmentsFromText(sourceText))
  }

  const updateWorkField = (field: 'hours' | 'minutes', value: string) => {
    const nextValue = Number(value)
    const safeValue = Number.isFinite(nextValue) ? Math.max(0, Math.trunc(nextValue)) : 0
    const nextInput = { ...workInput, [field]: field === 'minutes' ? Math.min(59, safeValue) : safeValue }
    setWorkInput(nextInput)
    setAssignment((current) => ({ ...current, totalWorkMinutes: totalMinutesFromWorkInput(nextInput) }))
  }

  const handleSyllabusFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    setImportStatus({ kind: 'idle', message: '' })
    setParsedAssignments([])

    const result = await readSyllabusFile(file)
    if (result.error) {
      setReadStatus({ kind: 'error', message: result.error, preview: '' })
      setSylInput('')
      latestExtractedTextRef.current = ''
      latestExtractedKindRef.current = null
      event.target.value = ''
      return
    }

    const nextText = result.text.trim()
    latestExtractedTextRef.current = nextText
    latestExtractedKindRef.current = result.kind
    setSylInput(nextText)

    const extracted = parseSyllabusText(nextText, result.kind)
    setParsedAssignments(extracted)
    setReadStatus({
      kind: extracted.length === 0 ? 'error' : 'success',
      message: extracted.length === 0
        ? 'Text was extracted, but no assignments were recognized. Add dates like “Assignment — 2026-10-27”.'
        : `Read ${result.kind.toUpperCase()} text successfully and found ${extracted.length} assignment${extracted.length === 1 ? '' : 's'}.`,
      preview: nextText.slice(0, 500),
    })

    event.target.value = ''
  }

  const onReadSyllabus = () => {
    const text = latestExtractedTextRef.current.trim() || sylInput.trim()
    const sourceKind = latestExtractedKindRef.current ?? 'txt'
    if (!text) {
      setReadStatus({ kind: 'error', message: 'No syllabus text found. Upload a file or paste text first.', preview: '' })
      return
    }

    const extracted = parseSyllabusText(text, sourceKind)
    setParsedAssignments(extracted)
    setReadStatus({
      kind: extracted.length === 0 ? 'error' : 'success',
      message: extracted.length === 0
        ? 'Text was extracted, but no assignments were recognized. Add dates like “Assignment — 2026-10-27”.'
        : `Read ${sourceKind.toUpperCase()} text successfully and found ${extracted.length} assignment${extracted.length === 1 ? '' : 's'}.`,
      preview: text.slice(0, 500),
    })
  }

  const addParsedAssignment = (entry: ParsedAssignment) => {
    if (!entry.dueDate) return

    const duplicateKey = `${normalizeCourseName(entry.courseName)}|${entry.title.trim().toLowerCase()}|${entry.dueDate}`
    const existingKeys = new Set(confirmedAssignments.map((item) => `${normalizeCourseName(item.courseName)}|${item.title.trim().toLowerCase()}|${item.dueDate}`))
    if (existingKeys.has(duplicateKey)) {
      setImportStatus({ kind: 'info', message: `${entry.title} is already in the planner.` })
      return
    }

    const assignmentToAdd: AssignmentSettings = {
      title: entry.title,
      courseName: entry.courseName?.trim() || undefined,
      dueDate: entry.dueDate,
      totalWorkMinutes: totalMinutesFromWorkInput({ hours: entry.workHours, minutes: entry.workMinutes }),
      sessionMinutes: assignment.sessionMinutes,
      bufferMinutes: assignment.bufferMinutes,
      studyDays: assignment.studyDays,
      studyStart: assignment.studyStart,
      studyEnd: assignment.studyEnd,
      campusId: assignment.campusId ?? selectedCampusId,
      campusBuildingId: assignment.campusBuildingId,
      roomNumber: assignment.roomNumber,
    }

    setConfirmedAssignments((current) => [...current, assignmentToAdd])
    setParsedAssignments((current) => current.map((item) => (item.id === entry.id ? { ...item, status: 'confirmed' } : item)))
    setImportStatus({ kind: 'success', message: `Saved ${entry.title} to your planner.` })
  }

  const removeParsedAssignment = (id: string) => setParsedAssignments((current) => current.filter((item) => item.id !== id))

  const updateParsedAssignment = (id: string, field: 'title' | 'dueDate' | 'workHours' | 'workMinutes' | 'courseName', value: string | number) => {
    setParsedAssignments((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === 'dueDate') {
          next.isMissingDate = !String(value)
          next.isAmbiguousDate = false
        }
        return next
      }),
    )
  }

  const onImportAssignments = () => {
    const validEntries = parsedAssignments.filter((entry) => entry.title.trim() && entry.dueDate && !entry.isMissingDate)
    if (validEntries.length === 0) {
      setImportStatus({ kind: 'error', message: 'No valid assignments are ready to import.' })
      return
    }

    const existingKeys = new Set(confirmedAssignments.map((item) => `${normalizeCourseName(item.courseName)}|${item.title.trim().toLowerCase()}|${item.dueDate}`))
    const newEntries: AssignmentSettings[] = []

    for (const entry of validEntries) {
      const key = `${normalizeCourseName(entry.courseName)}|${entry.title.trim().toLowerCase()}|${entry.dueDate}`
      if (existingKeys.has(key)) continue
      newEntries.push({
        title: entry.title.trim(),
        courseName: entry.courseName?.trim() || undefined,
        dueDate: entry.dueDate,
        totalWorkMinutes: totalMinutesFromWorkInput({ hours: entry.workHours, minutes: entry.workMinutes }),
        sessionMinutes: assignment.sessionMinutes,
        bufferMinutes: assignment.bufferMinutes,
        studyDays: assignment.studyDays,
        studyStart: assignment.studyStart,
        studyEnd: assignment.studyEnd,
        campusId: assignment.campusId ?? selectedCampusId,
        campusBuildingId: assignment.campusBuildingId,
        roomNumber: assignment.roomNumber,
      })
      existingKeys.add(key)
    }

    if (newEntries.length === 0) {
      setImportStatus({ kind: 'info', message: 'All extracted assignments are already saved to the planner.' })
      return
    }

    setConfirmedAssignments((current) => [...current, ...newEntries])
    setParsedAssignments((current) => current.map((entry) => ({ ...entry, status: 'confirmed' })))
    setImportStatus({ kind: 'success', message: `Imported ${newEntries.length} assignment${newEntries.length === 1 ? '' : 's'} successfully.` })
  }

  const addCommitment = () => {
    if (!draftCommitment.title || !draftCommitment.date || !draftCommitment.start || !draftCommitment.end) return

    setCommitments((current) => [
      ...current,
      {
        id: `c-${crypto.randomUUID()}`,
        title: draftCommitment.title,
        courseName: draftCommitment.courseName?.trim() || undefined,
        date: draftCommitment.date,
        start: draftCommitment.start,
        end: draftCommitment.end,
        campusId: draftCommitment.campusId || undefined,
        campusBuildingId: draftCommitment.campusBuildingId || undefined,
        roomNumber: draftCommitment.roomNumber || undefined,
      },
    ])

    setDraftCommitment((current) => ({
      ...current,
      title: 'Work Shift',
      courseName: '',
      date: assignment.dueDate,
      start: '12:00',
      end: '15:00',
      campusId: selectedCampusId,
      roomNumber: '',
    }))
  }

  const editAssignment: React.Dispatch<React.SetStateAction<AssignmentSettings>> = (update) => {
    const next = typeof update === 'function' ? update(assignment) : update
    setAssignment(next)
    setConfirmedAssignments((current) => current.map((item) => item.title === assignment.title && item.dueDate === assignment.dueDate && normalizeCourseName(item.courseName) === normalizeCourseName(assignment.courseName) ? next : item))
  }

  const clearCalendar = (scope: ClearScope) => {
    const result = clearCalendarItems(assignment, confirmedAssignments, commitments, scope)
    setConfirmedAssignments(result.assignments)
    setCommitments(result.commitments)
    if (result.removeActive) {
      setAssignment(result.assignment)
      setWorkInput({ hours: 0, minutes: 0 })
      setSessionStatusMap({})
    }
  }

  const labelActiveAssignment = (courseName: string) => {
    setAssignment((current) => ({ ...current, courseName }))
    setConfirmedAssignments((current) => current.map((item) => item.title === assignment.title && item.dueDate === assignment.dueDate && normalizeCourseName(item.courseName) === normalizeCourseName(assignment.courseName) ? { ...item, courseName } : item))
  }

  const removeCommitment = (id: string) => setCommitments((current) => current.filter((entry) => entry.id !== id))

  const updateSessionStatus = (id: string, status: StudySession['status']) => {
    setSessionStatusMap((current) => ({ ...current, [id]: status }))
  }

  const rescheduleUnfinished = () => {
    const refreshed = rescheduleMissedSessions(sessions, assignment, commitments, now)
    setSessionStatusMap((current) => {
      const next = { ...current }
      for (const session of refreshed) next[session.id] = session.status
      return next
    })
  }

  const toggleStudyDay = (day: (typeof daysOfWeek)[number]) => {
    setAssignment((current) => ({
      ...current,
      studyDays: current.studyDays.includes(day) ? current.studyDays.filter((entry) => entry !== day) : [...current.studyDays, day],
    }))
  }

  const location = useLocation()
  const pageTitle =
    location.pathname === '/' ? formatTodayHeaderDate(new Date())
      : location.pathname === '/planner' ? 'Planner'
      : location.pathname === '/assignments' ? 'Assignments'
        : location.pathname === '/syllabus' ? 'Syllabus'
          : location.pathname === '/calendar' ? 'Calendar'
            : location.pathname === '/schedule' ? 'My Schedule'
              : location.pathname === '/campus-map' ? 'Campus Map'
                : location.pathname === '/settings' ? 'Settings'
                : location.pathname === '/more' ? 'More'
                : formatTodayHeaderDate(new Date())

  const pageProps: PlannerProps = {
    assignment,
    setAssignment: editAssignment,
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
    selectedCampusId,
    setSelectedCampusId,
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
    selectedFileName,
    readStatus,
    importStatus,
    fileInputRef,
    onReadSyllabus,
    onImportAssignments,
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
    <div ref={appShellRef} className={isDark ? 'app-shell dark' : 'app-shell'} style={appStyle}>
      <aside className="sidebar desktop-sidebar">
        <div className="brand-block"><p className="eyebrow">Student on the Go</p><h1>Your study planner</h1></div>
        <nav className="nav-menu" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{item.label}</NavLink>
          ))}
        </nav>
        <button type="button" className="secondary-button theme-toggle" onClick={() => setIsDark((current) => !current)}>{isDark ? 'Light mode' : 'Dark mode'}</button>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div><h2>{pageTitle}</h2></div>
          <button type="button" className="secondary-button mobile-theme-toggle" onClick={() => setIsDark((current) => !current)}>{isDark ? 'Light' : 'Dark'}</button>
        </header>

        <Routes>
          <Route path="/" element={<TodayPage {...pageProps} />} />
          <Route path="/planner" element={<PlannerPage {...pageProps} />} />
          <Route path="/assignments" element={<AssignmentsPage {...pageProps} />} />
          <Route path="/syllabus" element={<SyllabusPage {...pageProps} />} />
          <Route path="/calendar" element={<CalendarPage assignment={assignment} confirmedAssignments={confirmedAssignments} commitments={commitments} sessions={sessions} completedItems={completedCalendarItems} onToggleComplete={(item, completed) => {
            if (item.kind === 'study') updateSessionStatus(item.id, completed ? 'completed' : 'planned')
            else setCompletedCalendarItems((current) => ({ ...current, [item.id]: completed }))
          }} cleanup={<CalendarCleanup
            assignment={assignment}
            assignments={confirmedAssignments}
            commitments={commitments}
            sessionCount={sessions.length}
            onLabelActive={labelActiveAssignment}
            onLabelAssignment={(index, courseName) => {
              const item = confirmedAssignments[index]
              setConfirmedAssignments((current) => current.map((entry, position) => position === index ? { ...entry, courseName } : entry))
              if (item.title === assignment.title && item.dueDate === assignment.dueDate && normalizeCourseName(item.courseName) === normalizeCourseName(assignment.courseName)) setAssignment((current) => ({ ...current, courseName }))
            }}
            onLabelCommitment={(id, courseName) => setCommitments((current) => current.map((item) => item.id === id ? { ...item, courseName } : item))}
            onClear={clearCalendar}
          />} />} />
          <Route path="/schedule" element={<MySchedulePage {...pageProps} />} />
          <Route path="/campus-map" element={<CampusMapPage selectedCampusId={selectedCampusId} confirmedAssignments={confirmedAssignments} commitments={commitments} />} />
          <Route
            path="/settings"
            element={(
              <SettingsPage
                selectedThemeId={selectedThemeId}
                onCollegeChange={handleCollegeChange}
                selectedTheme={selectedTheme}
                selectedCampusId={selectedCampusId}
                onCampusChange={handleCampusChange}
                isDark={isDark}
                setIsDark={setIsDark}
                settingsSavedMessage={settingsSavedMessage}
              />
            )}
          />
          <Route path="/more" element={<MorePage {...pageProps} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <nav ref={mobileNavRef} className="bottom-nav" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}>
            <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
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
