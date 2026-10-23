import assert from 'node:assert/strict'
import {
  deduplicateImportedAssignments,
  extractAssignmentsFromPdfText,
  extractAssignmentsFromText,
  parseDateCandidate,
} from './syllabus.ts'

const syllabus = `
Research Essay — 2026-10-27
Lab Report — 2026-10-29
Group Presentation — 2026-11-02
Research Essay — 2026-10-27
`

const parsed = extractAssignmentsFromText(syllabus)
assert.equal(parsed.length, 4, 'the parser should capture each visible assignment line before deduplication')
assert.equal(parseDateCandidate('10/27/2026'), '2026-10-27', 'should normalize month/day/year format')
assert.equal(parseDateCandidate('bad-date'), '', 'should reject unparseable dates')

const deduped = deduplicateImportedAssignments(parsed)
assert.equal(deduped.length, 3, 'duplicate imported assignments should be removed after review')

const ambiguous = extractAssignmentsFromText('Final Draft - no-date')
assert.equal(ambiguous.length, 0, 'should not silently fabricate missing dates')

const pdfText = `Discussion Post - 2026-10-27
Research Proposal - 2026-10-29
Reading Reflection - 2026-11-02
Research Outline - 2026-11-05
Research Essay Draft - 2026-11-10
Peer Review - 2026-11-12
Final Research Essay - 2026-11-17
Final Presentation - 2026-11-19`

const pdfParsed = extractAssignmentsFromPdfText(pdfText)
assert.equal(pdfParsed.length, 8, 'a text-based PDF with one line per assignment should yield all eight assignments')
assert.deepEqual(
  pdfParsed.map((entry) => ({ title: entry.title, dueDate: entry.dueDate })),
  [
    { title: 'Discussion Post', dueDate: '2026-10-27' },
    { title: 'Research Proposal', dueDate: '2026-10-29' },
    { title: 'Reading Reflection', dueDate: '2026-11-02' },
    { title: 'Research Outline', dueDate: '2026-11-05' },
    { title: 'Research Essay Draft', dueDate: '2026-11-10' },
    { title: 'Peer Review', dueDate: '2026-11-12' },
    { title: 'Final Research Essay', dueDate: '2026-11-17' },
    { title: 'Final Presentation', dueDate: '2026-11-19' },
  ],
  'the PDF parser should preserve the exact assignment list and date values from the syllabus',
)

console.log('syllabus tests passed')
