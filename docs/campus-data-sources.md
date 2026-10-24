# Campus building data

## Ohio State, Columbus

The selected nine active buildings use names, building numbers, addresses, scheduling abbreviations, and Latitude/Longitude values from [Ohio State's public Buildings GIS layer](https://gissvc.osu.edu/arcgis/rest/services/Apps/Campusmap_Buildings_POI/MapServer/1).

Source attribution: The Ohio State University, Facilities Information and Technology Services (FITS). Snapshot checked October 23, 2026.

The subset includes building numbers 0050, 0161, 0339, 0279, 0037, 0017, 0030, 0274, and 0246. Duplicate polygon features for the same building number were deduplicated. Only active Columbus buildings were selected. Coordinates are the source's location attributes, not inferred from a map image.

These are building locations, not verified entrances or indoor routes. This is a partial directory; the app links to the official campus map for complete coverage. Walking directions continue to open Google Maps.

## Michigan State, East Lansing

The ten retained locations use active BUILDING records from [MSU Spatial Data Management's WayfindingPoints layer](https://services.gis.msu.edu/ags-wayfinding/rest/services/WayfindingResources/MapServer/1). Query: `LOCATIONTYPE='BUILDING' AND LOCATIONSTATUS='ACTIVE'`, output spatial reference EPSG:4326. The response contained 955 active building records without truncation, checked October 23, 2026.

| App building | Official location ID |
| --- | --- |
| Bessey Hall | BUILDING-0079 |
| Engineering Building | BUILDING-0081 |
| MSU Union | BUILDING-0006 |
| Wells Hall | BUILDING-0078 |
| Natural Science | BUILDING-0024 |
| Hannah Administration | BUILDING-0067 |
| Berkey Hall | BUILDING-0002 |
| Holden Hall | BUILDING-0332 |
| Spartan Stadium | BUILDING-0058 |
| Library | BUILDING-0049 |

Coordinates are official point geometry rounded to seven decimal places. Holden's address was corrected to 234 Wilson Road. Spartan Stadium's 325 West Shaw Lane address is corroborated by the university's stadium bowl/gate BUILDINGPART records; the parent record has multiple facility addresses. Sheldon Hall and Mannering Hall were removed because they did not match active building records. This is a partial directory and these are building locations, not verified entrances.

## Other campus overview locations

`src/lib/campusOverviewData.ts` contains a small geographic data snapshot for 27 campuses, checked October 23, 2026, with per-entry OpenStreetMap source record links. Names and state/city context were reviewed before retaining each campus object. The stored values are campus bounding boxes, fitted to the map at runtime; they are never used as building walking destinations. These community-maintained boundaries are not official university surveys.

Rutgers New Brunswick combines the College Avenue, Busch, Livingston, and Cook–Douglass records. Nebraska Lincoln uses its City Campus record. Minnesota's bounds cover the Twin Cities campus relation. Broad university bounds may include nonacademic land; the official map remains the reference for specific buildings.

Geographic data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The overview snapshot retains this data license separately from the application's MIT-licensed code. Leaflet displays OpenStreetMap attribution on the interactive map. Source record URLs and this notice must accompany redistributions of the snapshot.

No runtime campus-geocoding request is made. Campuses with no saved buildings offer named-destination walking directions and official campus maps. Missing directory data is distinct from a search returning no matches. Future campuses with no saved overview show an unavailable-map message while keeping named directions and official links usable.

The [full audit](campus-map-audit.md) lists every campus, official link results, fixes, and verification limits.
