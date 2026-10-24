import { CAMPUS_OVERVIEWS, type CampusOverview } from './campusOverviewData.ts'

export type CampusBuilding = {
  id: string
  name: string
  shortName: string
  description: string
  destination: string
  address?: string
  officialMapUrl?: string
  latitude?: number
  longitude?: number
}

export type CampusConfig = {
  id: string
  universityName: string
  campusName: string
  city: string
  state: string
  buildings: CampusBuilding[]
  officialMapUrl: string
  mapResourcesUrl?: string
  fallbackDestination: string
  buildingCoverage: 'verified' | 'partial'
  centerLatitude?: number
  centerLongitude?: number
  overview?: CampusOverview
  dataSource?: string
}

export const OFFICIAL_MSU_CAMPUS_MAP_URL = 'https://maps.msu.edu/interactive/'
export const DEFAULT_CAMPUS_ID = 'msu'

// Source: MSU Spatial Data Management WayfindingResources/MapServer/1.
// Active BUILDING points in WGS84, checked 2026-10-23; not verified entrances.
export const MSU_CAMPUS: CampusConfig = {
  "id": "msu",
  "universityName": "Michigan State University",
  "campusName": "East Lansing Campus",
  "city": "East Lansing",
  "state": "Michigan",
  "officialMapUrl": "https://maps.msu.edu/interactive/",
  "fallbackDestination": "Michigan State University, East Lansing, Michigan",
  "buildingCoverage": "partial",
  "centerLatitude": 42.7317,
  "centerLongitude": -84.4817,
  "dataSource": "MSU Spatial Data Management WayfindingPoints; selected active buildings, checked 2026-10-23",
  "buildings": [
    {
      "id": "bessey-hall",
      "name": "Bessey Hall",
      "shortName": "Bessey",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Bessey Hall, Michigan State University, East Lansing, Michigan",
      "address": "434 Farm Ln, East Lansing MI 48824",
      "latitude": 42.7286468,
      "longitude": -84.4783799
    },
    {
      "id": "engineering-building",
      "name": "Engineering Building",
      "shortName": "Engineering",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Engineering Building, Michigan State University, East Lansing, Michigan",
      "address": "428 S Shaw Ln, East Lansing MI 48824",
      "latitude": 42.7247816,
      "longitude": -84.4815965
    },
    {
      "id": "msu-union",
      "name": "MSU Union",
      "shortName": "Union",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "MSU Union, Michigan State University, East Lansing, Michigan",
      "address": "49 Abbot Rd, East Lansing MI 48824",
      "latitude": 42.7341823,
      "longitude": -84.4828152
    },
    {
      "id": "wells-hall",
      "name": "Wells Hall",
      "shortName": "Wells",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Wells Hall, Michigan State University, East Lansing, Michigan",
      "address": "619 Red Cedar Rd, East Lansing MI 48824",
      "latitude": 42.7273801,
      "longitude": -84.4820661
    },
    {
      "id": "natural-science",
      "name": "Natural Science Building",
      "shortName": "Natural Science",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Natural Science Building, Michigan State University, East Lansing, Michigan",
      "address": "288 Farm Ln, East Lansing MI 48824",
      "latitude": 42.7310303,
      "longitude": -84.4768951
    },
    {
      "id": "hannah-hall",
      "name": "Hannah Administration Building",
      "shortName": "Hannah",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Hannah Administration Building, Michigan State University, East Lansing, Michigan",
      "address": "426 Auditorium Rd, East Lansing MI 48824",
      "latitude": 42.7296949,
      "longitude": -84.4815245
    },
    {
      "id": "berkey-hall",
      "name": "Berkey Hall",
      "shortName": "Berkey",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Berkey Hall, Michigan State University, East Lansing, Michigan",
      "address": "509 E Circle Dr, East Lansing MI 48824",
      "latitude": 42.7328636,
      "longitude": -84.4781566
    },
    {
      "id": "holden-hall",
      "name": "Holden Hall",
      "shortName": "Holden",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Holden Hall, Michigan State University, East Lansing, Michigan",
      "address": "234 Wilson Rd, East Lansing MI 48825",
      "latitude": 42.721033,
      "longitude": -84.4885868
    },
    {
      "id": "spartan-stadium",
      "name": "Spartan Stadium",
      "shortName": "Stadium",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Spartan Stadium, Michigan State University, East Lansing, Michigan",
      "address": "325 W Shaw Ln, East Lansing, MI 48824",
      "latitude": 42.7281655,
      "longitude": -84.4855906
    },
    {
      "id": "library",
      "name": "Michigan State University Library",
      "shortName": "Library",
      "description": "A building location from the official MSU campus wayfinding directory.",
      "destination": "Michigan State University Library, Michigan State University, East Lansing, Michigan",
      "address": "366 W Circle Dr, East Lansing MI 48824",
      "latitude": 42.7309381,
      "longitude": -84.4830467
    }
  ]
}

// Source: Ohio State FITS Campusmap_Buildings_POI, building IDs and Latitude/Longitude fields.
// Snapshot checked 2026-10-23. These building locations are not verified entrances.
const OHIO_STATE_BUILDINGS: CampusBuilding[] = [
  {
    "id": "osu-0050",
    "name": "Thompson Library",
    "shortName": "LI",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Thompson Library, The Ohio State University, Columbus, Ohio",
    "address": "1858 Neil Ave Mall, Columbus, OH 43210-1286",
    "latitude": 39.99925188,
    "longitude": -83.01488152
  },
  {
    "id": "osu-0161",
    "name": "Ohio Union",
    "shortName": "OU",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Ohio Union, The Ohio State University, Columbus, Ohio",
    "address": "1739 N High St, Columbus, OH 43210",
    "latitude": 39.99765973,
    "longitude": -83.00864174
  },
  {
    "id": "osu-0339",
    "name": "University Hall",
    "shortName": "UH",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "University Hall, The Ohio State University, Columbus, Ohio",
    "address": "230 N Oval Mall, Columbus, OH 43210-1335",
    "latitude": 40.00052277,
    "longitude": -83.01443196
  },
  {
    "id": "osu-0279",
    "name": "Dreese Laboratories",
    "shortName": "DL",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Dreese Laboratories, The Ohio State University, Columbus, Ohio",
    "address": "2015 Neil Ave, Columbus, OH 43210-1210",
    "latitude": 40.00222129,
    "longitude": -83.01599036
  },
  {
    "id": "osu-0037",
    "name": "Hagerty Hall",
    "shortName": "HH",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Hagerty Hall, The Ohio State University, Columbus, Ohio",
    "address": "1775 College Rd, Columbus, OH 43210-1340",
    "latitude": 39.99860531,
    "longitude": -83.01030783
  },
  {
    "id": "osu-0017",
    "name": "Knowlton Hall",
    "shortName": "KN",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Knowlton Hall, The Ohio State University, Columbus, Ohio",
    "address": "275 W Woodruff Ave, Columbus, OH 43210-1138",
    "latitude": 40.00359907,
    "longitude": -83.01678866
  },
  {
    "id": "osu-0030",
    "name": "Denney Hall",
    "shortName": "DE",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Denney Hall, The Ohio State University, Columbus, Ohio",
    "address": "164 Annie & John Glenn Ave, Columbus, OH 43210-1326",
    "latitude": 40.00130993,
    "longitude": -83.01252836
  },
  {
    "id": "osu-0274",
    "name": "Hitchcock Hall",
    "shortName": "HI",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Hitchcock Hall, The Ohio State University, Columbus, Ohio",
    "address": "2070 Neil Ave, Columbus, OH 43210-1226",
    "latitude": 40.00357404,
    "longitude": -83.01528456
  },
  {
    "id": "osu-0246",
    "name": "Recreation and Physical Activity Center",
    "shortName": "RP",
    "description": "A Columbus campus location listed by Ohio State Facilities Information and Technology Services.",
    "destination": "Recreation and Physical Activity Center, The Ohio State University, Columbus, Ohio",
    "address": "337 Annie & John Glenn Ave, Columbus, OH 43210-1224",
    "latitude": 39.9995101,
    "longitude": -83.0183801
  }
]

const EMPTY_BUILDINGS: CampusBuilding[] = []

const CAMPUS_ENTRIES: CampusConfig[] = [
  MSU_CAMPUS,
  {
    id: 'michigan-ann-arbor',
    universityName: 'University of Michigan',
    campusName: 'Ann Arbor Campus',
    city: 'Ann Arbor',
    state: 'Michigan',
    officialMapUrl: 'https://campusinfo.umich.edu/campus-map',
    fallbackDestination: 'University of Michigan, Ann Arbor, Michigan',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'michigan-dearborn',
    universityName: 'University of Michigan',
    campusName: 'Dearborn Campus',
    city: 'Dearborn',
    state: 'Michigan',
    officialMapUrl: 'https://umdearborn.edu/about-um-dearborn/visit-campus/maps-and-directions',
    fallbackDestination: 'University of Michigan-Dearborn, Dearborn, Michigan',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'ohio-state-columbus',
    mapResourcesUrl: 'https://fits.osu.edu/kb/how-guide-campus-map',
    universityName: 'The Ohio State University',
    campusName: 'Columbus Campus',
    city: 'Columbus',
    state: 'Ohio',
    officialMapUrl: 'https://maps.osu.edu/',
    fallbackDestination: 'The Ohio State University, Columbus, Ohio',
    buildingCoverage: 'partial',
    centerLatitude: 40.0005,
    centerLongitude: -83.0144,
    dataSource: 'Ohio State University FITS public building GIS; selected active Columbus buildings, checked 2026-10-23',
    buildings: OHIO_STATE_BUILDINGS,
  },
  {
    id: 'penn-state-university-park',
    universityName: 'Penn State',
    campusName: 'University Park Campus',
    city: 'University Park',
    state: 'Pennsylvania',
    officialMapUrl: 'https://map.psu.edu/',
    fallbackDestination: 'Penn State University Park, Pennsylvania',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'penn-state-harrisburg',
    universityName: 'Penn State',
    campusName: 'Harrisburg Campus',
    city: 'Middletown',
    state: 'Pennsylvania',
    officialMapUrl: 'https://harrisburg.psu.edu/campus-map',
    fallbackDestination: 'Penn State Harrisburg, Middletown, Pennsylvania',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'wisconsin-madison',
    mapResourcesUrl: 'https://www.wisc.edu/visit/',
    universityName: 'University of Wisconsin',
    campusName: 'Madison Campus',
    city: 'Madison',
    state: 'Wisconsin',
    officialMapUrl: 'https://map.wisc.edu/',
    fallbackDestination: 'University of Wisconsin-Madison, Madison, Wisconsin',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'minnesota-twin-cities',
    universityName: 'University of Minnesota',
    campusName: 'Twin Cities Campus',
    city: 'Minneapolis',
    state: 'Minnesota',
    officialMapUrl: 'https://campusmaps.umn.edu/',
    fallbackDestination: 'University of Minnesota Twin Cities, Minneapolis, Minnesota',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'iowa-iowa-city',
    universityName: 'University of Iowa',
    campusName: 'Iowa City Campus',
    city: 'Iowa City',
    state: 'Iowa',
    officialMapUrl: 'https://maps.uiowa.edu/',
    fallbackDestination: 'University of Iowa, Iowa City, Iowa',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'nebraska-lincoln',
    universityName: 'University of Nebraska',
    campusName: 'Lincoln Campus',
    city: 'Lincoln',
    state: 'Nebraska',
    officialMapUrl: 'https://maps.unl.edu/',
    fallbackDestination: 'University of Nebraska-Lincoln, Lincoln, Nebraska',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'indiana-bloomington',
    universityName: 'Indiana University',
    campusName: 'Bloomington Campus',
    city: 'Bloomington',
    state: 'Indiana',
    officialMapUrl: 'https://map.iu.edu/iub/',
    fallbackDestination: 'Indiana University Bloomington, Bloomington, Indiana',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'indiana-indianapolis',
    universityName: 'Indiana University',
    campusName: 'Indianapolis Campus',
    city: 'Indianapolis',
    state: 'Indiana',
    officialMapUrl: 'https://map.iu.edu/indianapolis/index.html',
    fallbackDestination: 'Indiana University Indianapolis, Indianapolis, Indiana',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'purdue-west-lafayette',
    universityName: 'Purdue University',
    campusName: 'West Lafayette Campus',
    city: 'West Lafayette',
    state: 'Indiana',
    officialMapUrl: 'https://www.purdue.edu/campus-map/',
    fallbackDestination: 'Purdue University, West Lafayette, Indiana',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'illinois-urbana-champaign',
    mapResourcesUrl: 'https://fs.illinois.edu/campus-maps-and-building-information',
    universityName: 'University of Illinois',
    campusName: 'Urbana-Champaign Campus',
    city: 'Champaign',
    state: 'Illinois',
    officialMapUrl: 'https://map.illinois.edu/',
    fallbackDestination: 'University of Illinois Urbana-Champaign, Champaign, Illinois',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'northwestern-evanston',
    universityName: 'Northwestern University',
    campusName: 'Evanston Campus',
    city: 'Evanston',
    state: 'Illinois',
    officialMapUrl: 'https://maps.northwestern.edu/',
    fallbackDestination: 'Northwestern University, Evanston, Illinois',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'rutgers-new-brunswick',
    universityName: 'Rutgers University',
    campusName: 'New Brunswick Campus',
    city: 'New Brunswick',
    state: 'New Jersey',
    officialMapUrl: 'https://maps.rutgers.edu/',
    fallbackDestination: 'Rutgers University-New Brunswick, New Brunswick, New Jersey',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'rutgers-newark',
    universityName: 'Rutgers University',
    campusName: 'Newark Campus',
    city: 'Newark',
    state: 'New Jersey',
    officialMapUrl: 'https://www.newark.rutgers.edu/visit/directions-campus',
    fallbackDestination: 'Rutgers University-Newark, Newark, New Jersey',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'maryland-college-park',
    mapResourcesUrl: 'https://cvs.umd.edu/visit/maps-directions',
    universityName: 'University of Maryland',
    campusName: 'College Park Campus',
    city: 'College Park',
    state: 'Maryland',
    officialMapUrl: 'https://maps.umd.edu/',
    fallbackDestination: 'University of Maryland, College Park, Maryland',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'oregon-eugene',
    universityName: 'University of Oregon',
    campusName: 'Eugene Campus',
    city: 'Eugene',
    state: 'Oregon',
    officialMapUrl: 'https://map.uoregon.edu/',
    fallbackDestination: 'University of Oregon, Eugene, Oregon',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'washington-seattle',
    universityName: 'University of Washington',
    campusName: 'Seattle Campus',
    city: 'Seattle',
    state: 'Washington',
    officialMapUrl: 'https://www.washington.edu/maps/',
    fallbackDestination: 'University of Washington, Seattle, Washington',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'ucla-westwood',
    mapResourcesUrl: 'https://transportation.ucla.edu/getting-around-campus/campus-maps',
    universityName: 'University of California, Los Angeles',
    campusName: 'Westwood Campus',
    city: 'Los Angeles',
    state: 'California',
    officialMapUrl: 'https://map.ucla.edu/',
    fallbackDestination: 'UCLA, Los Angeles, California',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'usc-university-park',
    mapResourcesUrl: 'https://usctrojans.com/documents/2025/11/12/usc-campus-map-with-parking.pdf',
    universityName: 'University of Southern California',
    campusName: 'University Park Campus',
    city: 'Los Angeles',
    state: 'California',
    officialMapUrl: 'https://web-app.usc.edu/maps/',
    fallbackDestination: 'University of Southern California, Los Angeles, California',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'notre-dame-south-bend',
    universityName: 'University of Notre Dame',
    campusName: 'South Bend Campus',
    city: 'Notre Dame',
    state: 'Indiana',
    officialMapUrl: 'https://map.nd.edu/',
    fallbackDestination: 'University of Notre Dame, Notre Dame, Indiana',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'alabama-tuscaloosa',
    universityName: 'University of Alabama',
    campusName: 'Tuscaloosa Campus',
    city: 'Tuscaloosa',
    state: 'Alabama',
    officialMapUrl: 'https://www.ua.edu/map/',
    fallbackDestination: 'University of Alabama, Tuscaloosa, Alabama',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'georgia-athens',
    mapResourcesUrl: 'https://www.architects.uga.edu/maps/pdf-maps',
    universityName: 'University of Georgia',
    campusName: 'Athens Campus',
    city: 'Athens',
    state: 'Georgia',
    officialMapUrl: 'https://maps.uga.edu/',
    fallbackDestination: 'University of Georgia, Athens, Georgia',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'texas-austin',
    universityName: 'University of Texas at Austin',
    campusName: 'Austin Campus',
    city: 'Austin',
    state: 'Texas',
    officialMapUrl: 'https://maps.utexas.edu/',
    fallbackDestination: 'University of Texas at Austin, Austin, Texas',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'florida-gainesville',
    universityName: 'University of Florida',
    campusName: 'Gainesville Campus',
    city: 'Gainesville',
    state: 'Florida',
    officialMapUrl: 'https://campusmap.ufl.edu/',
    fallbackDestination: 'University of Florida, Gainesville, Florida',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'virginia-tech-blacksburg',
    mapResourcesUrl: 'https://www.vt.edu/maps.html',
    universityName: 'Virginia Tech',
    campusName: 'Blacksburg Campus',
    city: 'Blacksburg',
    state: 'Virginia',
    officialMapUrl: 'https://www.maps.vt.edu/',
    fallbackDestination: 'Virginia Tech, Blacksburg, Virginia',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'snhu-manchester',
    universityName: 'Southern New Hampshire University',
    campusName: 'Manchester Campus',
    city: 'Manchester',
    state: 'New Hampshire',
    officialMapUrl: 'https://campus.snhu.edu/-/media/files/pdfs/snhu-campus-map-pdf-2026.pdf',
    fallbackDestination: 'Southern New Hampshire University, Manchester, New Hampshire',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
]

export const CAMPUS_CONFIGS: CampusConfig[] = CAMPUS_ENTRIES.map((campus) => ({
  ...campus,
  overview: CAMPUS_OVERVIEWS[campus.id],
}))

export function getCampusLabel(campus: CampusConfig): string {
  return `${campus.universityName} - ${campus.campusName}`
}

export function searchCampuses(term: string): CampusConfig[] {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return CAMPUS_CONFIGS
  return CAMPUS_CONFIGS.filter((campus) => {
    const label = `${campus.universityName} ${campus.campusName} ${campus.city} ${campus.state}`.toLowerCase()
    return label.includes(normalized)
  })
}

export function getCampusById(campusId: string | null | undefined): CampusConfig {
  return CAMPUS_CONFIGS.find((campus) => campus.id === campusId) ?? MSU_CAMPUS
}

export function getCampusBuildingById(campusId: string | null | undefined, buildingId: string | undefined): CampusBuilding | undefined {
  const campus = getCampusById(campusId)
  return campus.buildings.find((building) => building.id === buildingId)
}

function looksLikeCoordinates(value: string | undefined): boolean {
  return !!value && /^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/.test(value)
}

export function buildGoogleMapsWalkingUrl(destination: string | undefined, roomNumber?: string): string {
  const safeDestination = destination?.trim() || MSU_CAMPUS.fallbackDestination
  const params = new URLSearchParams({
    api: '1',
    travelmode: 'walking',
    destination: safeDestination,
  })

  if (roomNumber && roomNumber.trim() && !looksLikeCoordinates(safeDestination)) {
    params.set('destination', safeDestination)
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function buildCampusDirectionsUrl(campusId: string | null | undefined, buildingId: string | undefined, roomNumber?: string): string {
  const campus = getCampusById(campusId)
  const building = getCampusBuildingById(campusId, buildingId)

  if (!building) {
    return buildGoogleMapsWalkingUrl(campus.fallbackDestination, roomNumber)
  }

  const destinationValue = building.latitude !== undefined && building.longitude !== undefined
    ? `${building.latitude},${building.longitude}`
    : building.destination

  return buildGoogleMapsWalkingUrl(destinationValue, roomNumber)
}
