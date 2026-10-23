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
  fallbackDestination: string
  buildingCoverage: 'verified' | 'partial'
  centerLatitude?: number
  centerLongitude?: number
  dataSource?: string
}

export const OFFICIAL_MSU_CAMPUS_MAP_URL = 'https://maps.msu.edu/interactive/'
export const DEFAULT_CAMPUS_ID = 'msu'

export const MSU_CAMPUS: CampusConfig = {
  id: 'msu',
  universityName: 'Michigan State University',
  campusName: 'East Lansing Campus',
  city: 'East Lansing',
  state: 'Michigan',
  officialMapUrl: OFFICIAL_MSU_CAMPUS_MAP_URL,
  fallbackDestination: 'Michigan State University, East Lansing, Michigan',
  buildingCoverage: 'verified',
  centerLatitude: 42.7317,
  centerLongitude: -84.4817,
  dataSource: 'MSU interactive map and university location pages',
  buildings: [
    {
      id: 'bessey-hall',
      name: 'Bessey Hall',
      shortName: 'Bessey',
      description: 'A central science and teaching building near the heart of campus.',
      destination: 'Bessey Hall, Michigan State University, East Lansing, Michigan',
      address: '434 Farm Ln, East Lansing, MI 48824',
      latitude: 42.7309,
      longitude: -84.4782,
    },
    {
      id: 'engineering-building',
      name: 'Engineering Building',
      shortName: 'Engineering',
      description: 'A major engineering hub for labs, classrooms, and student projects.',
      destination: 'Engineering Building, Michigan State University, East Lansing, Michigan',
      address: '428 S Shaw Ln, East Lansing, MI 48824',
      latitude: 42.7242,
      longitude: -84.4815,
    },
    {
      id: 'msu-union',
      name: 'MSU Union',
      shortName: 'Union',
      description: 'Student services, meetings, food, and campus activity space.',
      destination: 'MSU Union, Michigan State University, East Lansing, Michigan',
      address: '49 Abbot Rd, East Lansing, MI 48824',
      latitude: 42.7345,
      longitude: -84.4832,
    },
    {
      id: 'wells-hall',
      name: 'Wells Hall',
      shortName: 'Wells',
      description: 'A central academic building with classrooms and humanities departments.',
      destination: 'Wells Hall, Michigan State University, East Lansing, Michigan',
      address: '619 Red Cedar Rd, East Lansing, MI 48824',
      latitude: 42.7333,
      longitude: -84.4799,
    },
    {
      id: 'natural-science',
      name: 'Natural Science Building',
      shortName: 'Natural Science',
      description: 'Home to large lecture halls and natural science instruction.',
      destination: 'Natural Science Building, Michigan State University, East Lansing, Michigan',
      address: '288 Farm Ln, East Lansing, MI 48824',
      latitude: 42.7319,
      longitude: -84.4787,
    },
    {
      id: 'hannah-hall',
      name: 'Hannah Administration Building',
      shortName: 'Hannah',
      description: 'Administrative offices, student support, and campus services.',
      destination: 'Hannah Administration Building, Michigan State University, East Lansing, Michigan',
      address: '426 Auditorium Rd, East Lansing, MI 48824',
      latitude: 42.7286,
      longitude: -84.4808,
    },
    {
      id: 'sheldon-hall',
      name: 'Sheldon Hall',
      shortName: 'Sheldon',
      description: 'Classroom and department space near the residential core of campus.',
      destination: 'Sheldon Hall, Michigan State University, East Lansing, Michigan',
      address: '135 Bogue St, East Lansing, MI 48825',
      latitude: 42.7337,
      longitude: -84.4717,
    },
    {
      id: 'mannering-hall',
      name: 'Mannering Hall',
      shortName: 'Mannering',
      description: 'Academic space for humanities and social science instruction.',
      destination: 'Mannering Hall, Michigan State University, East Lansing, Michigan',
      address: 'University Dr, East Lansing, MI 48824',
      latitude: 42.7296,
      longitude: -84.4738,
    },
    {
      id: 'berkey-hall',
      name: 'Berkey Hall',
      shortName: 'Berkey',
      description: 'A central classroom and lecture building on campus.',
      destination: 'Berkey Hall, Michigan State University, East Lansing, Michigan',
      address: '509 E Circle Dr, East Lansing, MI 48824',
      latitude: 42.7314,
      longitude: -84.4808,
    },
    {
      id: 'holden-hall',
      name: 'Holden Hall',
      shortName: 'Holden',
      description: 'Academic classrooms and student support spaces with a central campus location.',
      destination: 'Holden Hall, Michigan State University, East Lansing, Michigan',
      address: '55 S Wilson Rd, East Lansing, MI 48825',
      latitude: 42.7218,
      longitude: -84.477,
    },
    {
      id: 'spartan-stadium',
      name: 'Spartan Stadium',
      shortName: 'Stadium',
      description: 'Home of MSU athletics and campus event venue.',
      destination: 'Spartan Stadium, Michigan State University, East Lansing, Michigan',
      address: '325 W Shaw Ln, East Lansing, MI 48824',
      latitude: 42.7281,
      longitude: -84.491,
    },
    {
      id: 'library',
      name: 'Michigan State University Library',
      shortName: 'Library',
      description: 'A major campus destination for study space and academic support.',
      destination: 'Michigan State University Library, Michigan State University, East Lansing, Michigan',
      address: '366 W Circle Dr, East Lansing, MI 48824',
      latitude: 42.7298,
      longitude: -84.4844,
    },
  ],
}

const EMPTY_BUILDINGS: CampusBuilding[] = []

export const CAMPUS_CONFIGS: CampusConfig[] = [
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
    officialMapUrl: 'https://umdearborn.edu/about/campus-map',
    fallbackDestination: 'University of Michigan-Dearborn, Dearborn, Michigan',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'ohio-state-columbus',
    universityName: 'The Ohio State University',
    campusName: 'Columbus Campus',
    city: 'Columbus',
    state: 'Ohio',
    officialMapUrl: 'https://maps.osu.edu/',
    fallbackDestination: 'The Ohio State University, Columbus, Ohio',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
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
    officialMapUrl: 'https://map.iu.edu/iui/',
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
    officialMapUrl: 'https://newark.rutgers.edu/maps-directions',
    fallbackDestination: 'Rutgers University-Newark, Newark, New Jersey',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'maryland-college-park',
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
    officialMapUrl: 'https://map.ua.edu/',
    fallbackDestination: 'University of Alabama, Tuscaloosa, Alabama',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
  {
    id: 'georgia-athens',
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
    officialMapUrl: 'https://www.snhu.edu/about-us/campus-tour',
    fallbackDestination: 'Southern New Hampshire University, Manchester, New Hampshire',
    buildingCoverage: 'partial',
    buildings: EMPTY_BUILDINGS,
  },
]

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
