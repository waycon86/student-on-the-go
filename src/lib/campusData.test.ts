import assert from 'node:assert/strict'
import {
  buildCampusDirectionsUrl,
  buildGoogleMapsWalkingUrl,
  DEFAULT_CAMPUS_ID,
  getCampusById,
} from './campusData.ts'

const campus = getCampusById(DEFAULT_CAMPUS_ID)
const bessey = campus.buildings.find((building) => building.id === 'bessey-hall')

assert.equal(!!bessey, true, 'expected Bessey Hall in MSU campus configuration')

const url = buildCampusDirectionsUrl(DEFAULT_CAMPUS_ID, 'bessey-hall', '203')
const parsed = new URL(url)

assert.equal(parsed.origin, 'https://www.google.com', 'directions should use Google Maps web URL')
assert.equal(parsed.pathname, '/maps/dir/', 'directions should target Google Maps direction endpoint')
assert.equal(parsed.searchParams.get('api'), '1', 'maps URL should include api=1')
assert.equal(parsed.searchParams.get('travelmode'), 'walking', 'travel mode should be walking')
assert.equal(parsed.searchParams.has('origin'), false, 'origin should be omitted to let Google Maps request/use current location')
const expectedDestination = bessey?.latitude !== undefined && bessey?.longitude !== undefined
  ? `${bessey.latitude},${bessey.longitude}`
  : bessey?.destination
assert.equal(parsed.searchParams.get('destination'), expectedDestination, 'building destination should use verified coordinates when available, otherwise destination text')

const namedDestination = buildGoogleMapsWalkingUrl('Wells Hall, Michigan State University, East Lansing, Michigan', 'A-101')
const namedParsed = new URL(namedDestination)
assert.equal(
  namedParsed.searchParams.get('destination'),
  'Wells Hall, Michigan State University, East Lansing, Michigan',
  'room details should remain separate from destination to keep building-level walking directions',
)

const fallback = buildCampusDirectionsUrl(DEFAULT_CAMPUS_ID, undefined)
const fallbackParsed = new URL(fallback)
assert.equal(
  fallbackParsed.searchParams.get('destination'),
  'Michigan State University, East Lansing, Michigan',
  'unknown buildings should fall back to campus-level destination',
)

console.log('campus data tests passed')