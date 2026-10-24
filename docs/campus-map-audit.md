# Campus map audit

Checked October 23, 2026 (America/New_York). Scope: all 29 configured campuses across 25 universities, map and directions behavior, official map links, saved building positions, and phone/desktop layout. This report describes the changes proposed in PR #4; it does not certify a production deployment.

## Findings and corrections

- Replaced four official URLs returning HTTP 404: Michigan–Dearborn, IU Indianapolis, Rutgers Newark, and SNHU. SNHU now opens its 2026 campus-map PDF. Updated Alabama to its working official map entry page.
- Final primary URLs: 21 returned HTTP 200; eight interactive providers returned 403/503 in automated retrieval. These eight are **unverified, not proven broken**. Added official help/download alternatives: seven returned 200; Wisconsin's alternative also returned 503.
- Corrected all ten retained MSU pins against active records in the university's public GIS. Previous offsets ranged from 47 to 950 metres. Removed Sheldon Hall and Mannering Hall because neither matched an active BUILDING record in that source; this does not establish that similarly named places never existed.
- Added nine sourced active Ohio State Columbus buildings. Both internal directories are partial. Total: 19 pins across two campuses; the remaining 27 campuses have no saved building directory.
- Replaced runtime first-result campus geocoding with 27 reviewed, attributed OpenStreetMap overview bounds. Live searches had returned a Maryland railway station and a Rutgers dental office, no results for Penn State Harrisburg and Minnesota, and only Nebraska's East Campus for the broad Lincoln selection. Reviewed campus records now cover those cases; Rutgers combines College Avenue, Busch, Livingston, and Cook–Douglass, and Nebraska's overview explicitly covers City Campus.
- Overview bounds fit multi-area campuses instead of treating a polygon centroid as an academic building. Overview locations never become building walking destinations. Directions without a saved building use the selected campus's name; typed destinations include its university, city, and state.
- Missing building data, unmatched searches, empty class filters, invalid campus links, and invalid building links receive distinct useful states. An invalid campus link uses the student's selected campus. An unknown building does not select an unrelated building.
- Full campus names wrap below the mobile picker. Links are styled as actions, and touch maps retain the Move map / Scroll page controls.

## All configured campuses

HTTP results are point-in-time retrieval checks, not full interactive acceptance tests. A 200 can be an entry page, download page, or PDF. OSM bounds are community-maintained overview data, not official building or entrance positions. All source record URLs and bounds are checked into `src/lib/campusOverviewData.ts` under ODbL 1.0.

| Campus | Saved pins | Overview source | Official map check | Help/download check |
| --- | ---: | --- | --- | --- |
| Michigan State University · East Lansing Campus | 10 | Configured campus center; official GIS building points | [HTTP 200](https://maps.msu.edu/interactive/) | — |
| University of Michigan · Ann Arbor Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://campusinfo.umich.edu/campus-map) | — |
| University of Michigan · Dearborn Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://umdearborn.edu/about-um-dearborn/visit-campus/maps-and-directions) | — |
| The Ohio State University · Columbus Campus | 9 | Configured campus center; official GIS building points | [Unverified (HTTP 403)](https://maps.osu.edu/) | [HTTP 200](https://fits.osu.edu/kb/how-guide-campus-map) |
| Penn State · University Park Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://map.psu.edu/) | — |
| Penn State · Harrisburg Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://harrisburg.psu.edu/campus-map) | — |
| University of Wisconsin · Madison Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://map.wisc.edu/) | [Unverified (HTTP 503)](https://www.wisc.edu/visit/) |
| University of Minnesota · Twin Cities Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://campusmaps.umn.edu/) | — |
| University of Iowa · Iowa City Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://maps.uiowa.edu/) | — |
| University of Nebraska · Lincoln Campus | 0 | Reviewed OSM campus bounds (City Campus) | [HTTP 200](https://maps.unl.edu/) | — |
| Indiana University · Bloomington Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://map.iu.edu/iub/) | — |
| Indiana University · Indianapolis Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://map.iu.edu/indianapolis/index.html) | — |
| Purdue University · West Lafayette Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://www.purdue.edu/campus-map/) | — |
| University of Illinois · Urbana-Champaign Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://map.illinois.edu/) | [HTTP 200](https://fs.illinois.edu/campus-maps-and-building-information) |
| Northwestern University · Evanston Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://maps.northwestern.edu/) | — |
| Rutgers University · New Brunswick Campus | 0 | Reviewed OSM campus bounds (four campus areas) | [HTTP 200](https://maps.rutgers.edu/) | — |
| Rutgers University · Newark Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://www.newark.rutgers.edu/visit/directions-campus) | — |
| University of Maryland · College Park Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://maps.umd.edu/) | [HTTP 200](https://cvs.umd.edu/visit/maps-directions) |
| University of Oregon · Eugene Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://map.uoregon.edu/) | — |
| University of Washington · Seattle Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://www.washington.edu/maps/) | — |
| University of California, Los Angeles · Westwood Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://map.ucla.edu/) | [HTTP 200](https://transportation.ucla.edu/getting-around-campus/campus-maps) |
| University of Southern California · University Park Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://web-app.usc.edu/maps/) | [HTTP 200](https://usctrojans.com/documents/2025/11/12/usc-campus-map-with-parking.pdf) |
| University of Notre Dame · South Bend Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://map.nd.edu/) | — |
| University of Alabama · Tuscaloosa Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://www.ua.edu/map/) | — |
| University of Georgia · Athens Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://maps.uga.edu/) | [HTTP 200](https://www.architects.uga.edu/maps/pdf-maps) |
| University of Texas at Austin · Austin Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://maps.utexas.edu/) | — |
| University of Florida · Gainesville Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://campusmap.ufl.edu/) | — |
| Virginia Tech · Blacksburg Campus | 0 | Reviewed OSM campus bounds | [Unverified (HTTP 503)](https://www.maps.vt.edu/) | [HTTP 200](https://www.vt.edu/maps.html) |
| Southern New Hampshire University · Manchester Campus | 0 | Reviewed OSM campus bounds | [HTTP 200](https://campus.snhu.edu/-/media/files/pdfs/snhu-campus-map-pdf-2026.pdf) | — |

## Verification and limits

- Production build, ESLint, campus-data invariants, and whitespace validation passed. Vite reports a nonblocking approximately 508 kB main-chunk size advisory.
- Final Chromium layout/interaction checks cover every campus at 320×568 dark, 390×844 light, 844×390 dark, and 1366×900 light: 116 campus/viewport cases. Checks include expected marker counts, correct selected campus and official links, named walking destinations, invalid building links, touch mode controls, and no horizontal page overflow.
- External requests are blocked in browser layout tests: the app performs zero runtime campus-geocoder requests. Tile imagery and fonts are not certified by these tests. Actual source coordinates and official URLs were audited separately. An invalid campus link and a future missing-overview fallback are also checked.
- These checks emulate Chromium devices; physical iPhone Safari scrolling and external Google Maps navigation still need verification after deployment. Third-party tile availability, indoor navigation, entrance accessibility, and complete building coverage are outside this audit.

See [data sources](campus-data-sources.md) for source attribution and geographic-data licensing.
