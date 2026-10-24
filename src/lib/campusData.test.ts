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

const ohioState = getCampusById('ohio-state-columbus')
const thompson = ohioState.buildings.find((building) => building.id === 'osu-0050')
assert.ok(thompson, 'Ohio State should include its official Thompson Library location')
const ohioDestination = new URL(buildCampusDirectionsUrl(ohioState.id, thompson.id)).searchParams.get('destination')!
const [ohioLatitude, ohioLongitude] = ohioDestination.split(',').map(Number)
assert.ok(ohioLatitude > 39.97 && ohioLatitude < 40.04 && ohioLongitude > -83.06 && ohioLongitude < -82.98, 'Ohio State building directions must stay in Columbus')
assert.equal(
  new URL(buildCampusDirectionsUrl(ohioState.id, 'bessey-hall')).searchParams.get('destination'),
  ohioState.fallbackDestination,
  'a building ID from MSU must not resolve to an MSU destination while Ohio State is selected',
)
const noDirectory = getCampusById('michigan-ann-arbor')
assert.equal(
  new URL(buildCampusDirectionsUrl(noDirectory.id, undefined)).searchParams.get('destination'),
  noDirectory.fallbackDestination,
  'campuses without a building directory must retain their own campus destination',
)

console.log('campus data tests passed')
