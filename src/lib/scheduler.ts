export type DayName = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type SessionStatus = 'planned' | 'completed' | 'missed'

export type Commitment = {
  id: string
  title: string
  date: string
  start: string
  end: string
  campusId?: string
  campusBuildingId?: string
  customLocationQuery?: string
  roomNumber?: string
}

export type StudySession = {
  id: string
  assignmentId: string
  milestone: string
  start: string
  end: string
  status: SessionStatus
}

export type AssignmentSettings = {
  title: string
  dueDate: string
  totalWorkMinutes: number
  sessionMinutes: number
  bufferMinutes: number
  studyDays: DayName[]
  studyStart: string
  studyEnd: string
  campusId?: string
  campusBuildingId?: string
  customLocationQuery?: string
  roomNumber?: string
}

export const MILESTONE_ORDER = ['Research', 'Outline', 'Draft', 'Revise'] as const

export function buildMilestones(totalWorkMinutes: number) {
  const weights = [0.22, 0.2, 0.33, 0.25]
  const milestoneMinutes = weights.map((weight) => Math.round(totalWorkMinutes * weight))
  const totalAllocated = milestoneMinutes.reduce((sum, value) => sum + value, 0)
  const adjusted = [...milestoneMinutes]
  adjusted[adjusted.length - 1] += Math.max(totalWorkMinutes - totalAllocated, 0)

  return MILESTONE_ORDER.map((name, index) => ({
    name,
    minutes: adjusted[index],
  }))
}

function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  return next
}

function dayNameFromDate(date: Date): DayName {
  const names: DayName[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return names[date.getDay()]
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB
}

function getOpenIntervals(
  date: Date,
  studyStart: string,
  studyEnd: string,
  commitments: Commitment[],
  blockedIntervals: Array<{ start: Date; end: Date }> = [],
): Array<{ start: Date; end: Date }> {
  const intervals: Array<{ start: Date; end: Date }> = [
    { start: toDateTime(date, studyStart), end: toDateTime(date, studyEnd) },
  ]

  const dayKey = date.toISOString().slice(0, 10)
  const dayCommitments = commitments.filter((entry) => entry.date === dayKey)
  const allBlocked = [...dayCommitments.map((entry) => ({
    start: toDateTime(date, entry.start),
    end: toDateTime(date, entry.end),
  })), ...blockedIntervals]

  for (const blocked of allBlocked) {
    const nextIntervals: Array<{ start: Date; end: Date }> = []

    for (const interval of intervals) {
      if (overlaps(interval.start, interval.end, blocked.start, blocked.end)) {
        if (interval.start < blocked.start) {
          nextIntervals.push({ start: interval.start, end: blocked.start })
        }
        if (blocked.end < interval.end) {
          nextIntervals.push({ start: blocked.end, end: interval.end })
        }
      } else {
        nextIntervals.push(interval)
      }
    }

    intervals.splice(0, intervals.length, ...nextIntervals)
  }

  return intervals.filter((interval) => interval.start < interval.end)
}

export function buildStudyPlan(
  assignment: AssignmentSettings,
  commitments: Commitment[],
  now: Date = new Date(),
  blockedIntervals: Array<{ start: Date; end: Date }> = [],
): { sessions: StudySession[]; remainingWorkMinutes: number; plannedMinutes: number; totalCapacityMinutes: number } {
  const dueDate = new Date(`${assignment.dueDate}T23:59:59`)
  const safeDeadline = new Date(dueDate)
  safeDeadline.setMinutes(safeDeadline.getMinutes() - assignment.bufferMinutes)

  const sessions: StudySession[] = []
  const totalDaysToCheck = 45
  let remainingWorkMinutes = Math.max(assignment.totalWorkMinutes, 0)
  let totalCapacityMinutes = 0

  for (let step = 0; step < totalDaysToCheck; step += 1) {
    const candidateDate = addDays(dueDate, -step)
    const dayKey = candidateDate.toISOString().slice(0, 10)

    if (!assignment.studyDays.includes(dayNameFromDate(candidateDate))) {
      continue
    }

    if (candidateDate < normalizeDate(now)) {
      continue
    }

    const openIntervals = getOpenIntervals(
      candidateDate,
      assignment.studyStart,
      assignment.studyEnd,
      commitments,
      blockedIntervals.filter((interval) => {
        const sameDay = interval.start.toISOString().slice(0, 10) === dayKey
        return sameDay
      }),
    )

    const sortedIntervals = [...openIntervals].sort(
      (a, b) => new Date(b.end).getTime() - new Date(a.end).getTime(),
    )

    for (const interval of sortedIntervals) {
      if (remainingWorkMinutes <= 0) break

      const latestEnd = new Date(Math.min(new Date(interval.end).getTime(), safeDeadline.getTime()))
      let cursor = latestEnd

      while (remainingWorkMinutes > 0 && cursor > interval.start) {
        const sessionStart = new Date(cursor)
        sessionStart.setMinutes(sessionStart.getMinutes() - assignment.sessionMinutes)

        if (sessionStart < interval.start) {
          break
        }

        if (sessionStart < now) {
          cursor = new Date(sessionStart)
          continue
        }

        const sessionEnd = new Date(cursor)
        const sessionId = `${assignment.title}-${dayKey}-${sessionStart.getTime()}`

        sessions.push({
          id: sessionId,
          assignmentId: `${assignment.title}-${dayKey}`,
          milestone: MILESTONE_ORDER[(sessions.length + 1) % MILESTONE_ORDER.length],
          start: sessionStart.toISOString(),
          end: sessionEnd.toISOString(),
          status: 'planned',
        })

        totalCapacityMinutes += assignment.sessionMinutes
        remainingWorkMinutes -= assignment.sessionMinutes
        cursor = new Date(sessionStart)
      }
    }

    if (remainingWorkMinutes <= 0) {
      break
    }
  }

  const finalizedSessions = [...sessions].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )

  return {
    sessions: finalizedSessions,
    remainingWorkMinutes: Math.max(remainingWorkMinutes, 0),
    plannedMinutes: Math.max(assignment.totalWorkMinutes - remainingWorkMinutes, 0),
    totalCapacityMinutes,
  }
}

export function buildMultiAssignmentPlan(
  assignments: AssignmentSettings[],
  commitments: Commitment[],
  now: Date = new Date(),
): { sessions: StudySession[]; plannedMinutes: number; remainingWorkMinutes: number } {
  const plannedSessions: StudySession[] = []
  let plannedMinutes = 0
  let remainingMinutes = 0

  const sortedAssignments = [...assignments].sort((a, b) => {
    return new Date(`${a.dueDate}T00:00:00`).getTime() - new Date(`${b.dueDate}T00:00:00`).getTime()
  })

  for (const assignment of sortedAssignments) {
    const blockedIntervals = plannedSessions.map((session) => ({
      start: new Date(session.start),
      end: new Date(session.end),
    }))

    const plan = buildStudyPlan(assignment, commitments, now, blockedIntervals)
    const assignmentSessions = plan.sessions.map((session) => ({
      ...session,
      assignmentId: `${assignment.title}-${session.start}`,
    }))

    plannedSessions.push(...assignmentSessions)
    plannedMinutes += plan.plannedMinutes
    remainingMinutes += plan.remainingWorkMinutes
  }

  return {
    sessions: plannedSessions.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    ),
    plannedMinutes,
    remainingWorkMinutes: remainingMinutes,
  }
}

export function rescheduleMissedSessions(
  sessions: StudySession[],
  assignment: AssignmentSettings,
  commitments: Commitment[],
  now: Date = new Date(),
): StudySession[] {
  const completedSessions = sessions.filter((session) => session.status === 'completed')
  const unfinishedSessions = sessions.filter((session) => session.status !== 'completed')
  const unfinishedMinutes = unfinishedSessions.length * assignment.sessionMinutes

  if (unfinishedMinutes <= 0) {
    return completedSessions
  }

  const rescheduledPlan = buildStudyPlan(
    {
      ...assignment,
      totalWorkMinutes: unfinishedMinutes,
    },
    commitments,
    now,
  )

  return [...completedSessions, ...rescheduledPlan.sessions].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}

export function getMinutesAvailable(
  assignment: AssignmentSettings,
  commitments: Commitment[],
  now: Date = new Date(),
): number {
  const result = buildStudyPlan(assignment, commitments, now)
  return result.totalCapacityMinutes
}
