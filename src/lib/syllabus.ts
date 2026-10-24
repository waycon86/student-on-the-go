export type ParsedAssignment = {
  id: string
  title: string
  courseName?: string
  dueDate: string
  workHours: number
  workMinutes: number
  sourceText: string
  status: 'draft' | 'confirmed'
  isMissingDate: boolean
  isAmbiguousDate: boolean
}

export function parseDateCandidate(value: string): string {
  if (!value) return ''

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const month = Number(slashMatch[1])
    const day = Number(slashMatch[2])
    const year = Number(slashMatch[3])
    if (month <= 12 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  const hyphenMatch = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/)
  if (hyphenMatch) {
    const month = Number(hyphenMatch[1])
    const day = Number(hyphenMatch[2])
    const year = Number(hyphenMatch[3])
    if (month <= 12 && day <= 31) {
      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  return ''
}

function buildAssignmentMatchPattern() {
  return /^(.+?)\s*(?:-|–|—)\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*$/
}

function normalizeTextForAssignmentParsing(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

export function extractAssignmentsFromText(text: string): ParsedAssignment[] {
  const lines = normalizeTextForAssignmentParsing(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const parsed: ParsedAssignment[] = []
  const pattern = buildAssignmentMatchPattern()

  for (const rawLine of lines) {
    const match = rawLine.match(pattern)
    if (!match) continue

    const title = match[1].trim().replace(/\s+/g, ' ')
    const dueDateText = match[2].trim()
    const parsedDate = parseDateCandidate(dueDateText)

    parsed.push({
      id: `parsed-${crypto.randomUUID()}`,
      title,
      dueDate: parsedDate ?? '',
      workHours: 1,
      workMinutes: 0,
      sourceText: rawLine,
      status: 'draft',
      isMissingDate: !parsedDate,
      isAmbiguousDate: Boolean(dueDateText && !parsedDate),
    })
  }

  return parsed
}

export function extractAssignmentsFromPdfText(text: string): ParsedAssignment[] {
  const normalized = normalizeTextForAssignmentParsing(text)
  if (!normalized) return []

  const lines = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const parsed: ParsedAssignment[] = []
  const pattern = buildAssignmentMatchPattern()

  for (const line of lines) {
    const match = line.match(pattern)
    if (!match) continue

    const title = match[1].trim().replace(/\s+/g, ' ')
    const dueDateText = match[2].trim()
    const dueDate = parseDateCandidate(dueDateText)

    if (!title || !dueDate) continue

    parsed.push({
      id: `parsed-${crypto.randomUUID()}`,
      title,
      dueDate,
      workHours: 1,
      workMinutes: 0,
      sourceText: line,
      status: 'draft',
      isMissingDate: !dueDate,
      isAmbiguousDate: Boolean(dueDateText && !dueDate),
    })
  }

  return deduplicateImportedAssignments(parsed)
}

export function deduplicateImportedAssignments(assignments: ParsedAssignment[]): ParsedAssignment[] {
  const seen = new Set<string>()

  return assignments.filter((entry) => {
    const key = `${entry.title.toLowerCase().trim()}-${entry.dueDate}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function readSyllabusFile(file: File): Promise<{ text: string; kind: 'txt' | 'pdf'; error?: string }> {
  const type = file.name.toLowerCase()

  return new Promise((resolve) => {
    if (type.endsWith('.txt')) {
      file.text().then((text) => resolve({ text, kind: 'txt' })).catch(() => resolve({
        text: '',
        kind: 'txt',
        error: 'This .txt file could not be read. Please paste the syllabus text into the text box instead.',
      }))
      return
    }

    if (type.endsWith('.pdf')) {
      file.arrayBuffer()
        .then(async (bytes) => {
          try {
            const pdfjs = await import('pdfjs-dist')
            pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
            const pdf = await pdfjs.getDocument({ data: bytes }).promise
            let text = ''

            for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
              const page = await pdf.getPage(pageIndex)
              const content = await page.getTextContent()
              const pageLines = new Map<number, { x: number; content: string[] }>()

              for (const item of content.items) {
                if (!('str' in item)) continue
                const y = Number(item.transform[5].toFixed(2))
                const x = Number(item.transform[4].toFixed(2))
                const entry = pageLines.get(y) ?? { x, content: [] }
                entry.content.push(item.str)
                if (x < entry.x) entry.x = x
                pageLines.set(y, entry)
              }

              const pageText = Array.from(pageLines.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([, line]) => line.content.join(' '))
                .join('\n')
                .trim()

              if (pageText) {
                text += `${text ? '\n\n' : ''}${pageText}`
              }
            }

            if (!text.trim()) {
              resolve({
                text: '',
                kind: 'pdf',
                error: 'PDF contains no readable text. Please paste the syllabus text manually as a fallback.',
              })
              return
            }

            resolve({ text, kind: 'pdf' })
          } catch {
            resolve({
              text: '',
              kind: 'pdf',
              error: 'This PDF could not be read in the browser. Please paste the syllabus text as a fallback or upload a plain .txt version.',
            })
          }
        })
        .catch(() => resolve({
          text: '',
          kind: 'pdf',
          error: 'This PDF could not be read in the browser. Please paste the syllabus text as a fallback or upload a plain .txt version.',
        }))
      return
    }

    resolve({
      text: '',
      kind: 'txt',
      error: 'Unsupported file type. Please upload a .txt or PDF syllabus file.',
    })
  })
}
