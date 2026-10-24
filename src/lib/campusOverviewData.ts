// Campus overview bounds, reviewed 2026-10-23. Not building or entrance coordinates.
// Geographic data © OpenStreetMap contributors, licensed under ODbL 1.0.
// https://www.openstreetmap.org/copyright — see docs/campus-data-sources.md.
export type CampusOverview = {
  bounds: [[number, number], [number, number]]
  sources: string[]
}

export const CAMPUS_OVERVIEWS: Record<string, CampusOverview> = {
  "michigan-ann-arbor": {
    "bounds": [
      [
        42.242226,
        -83.7502236
      ],
      [
        42.3125148,
        -83.6649743
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/3990210"
    ]
  },
  "michigan-dearborn": {
    "bounds": [
      [
        42.3126688,
        -83.2385565
      ],
      [
        42.322114,
        -83.2271925
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/228379953"
    ]
  },
  "penn-state-university-park": {
    "bounds": [
      [
        40.7798241,
        -77.8918409
      ],
      [
        40.8253481,
        -77.8293611
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/14073946"
    ]
  },
  "wisconsin-madison": {
    "bounds": [
      [
        43.067811,
        -89.445974
      ],
      [
        43.0927578,
        -89.3941037
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/7144092"
    ]
  },
  "iowa-iowa-city": {
    "bounds": [
      [
        41.6299287,
        -91.5418773
      ],
      [
        41.6322959,
        -91.5394944
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/261136511"
    ]
  },
  "nebraska-lincoln": {
    "bounds": [
      [
        40.8148667,
        -96.7082515
      ],
      [
        40.8392378,
        -96.682322
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/12032853"
    ]
  },
  "indiana-bloomington": {
    "bounds": [
      [
        39.1627004,
        -86.5284359
      ],
      [
        39.1965546,
        -86.4898149
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/74173036"
    ]
  },
  "indiana-indianapolis": {
    "bounds": [
      [
        39.7682723,
        -86.1886037
      ],
      [
        39.7808122,
        -86.1669266
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/21386893"
    ]
  },
  "purdue-west-lafayette": {
    "bounds": [
      [
        40.4083634,
        -87.0007831
      ],
      [
        40.4793251,
        -86.9092811
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/12444296"
    ]
  },
  "illinois-urbana-champaign": {
    "bounds": [
      [
        40.0261129,
        -88.2909822
      ],
      [
        40.1163395,
        -88.1902577
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/12299045"
    ]
  },
  "northwestern-evanston": {
    "bounds": [
      [
        42.0468992,
        -87.69472
      ],
      [
        42.0687508,
        -87.6692517
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/2105485"
    ]
  },
  "rutgers-new-brunswick": {
    "bounds": [
      [
        40.4589405,
        -74.4876178
      ],
      [
        40.531726,
        -74.4150993
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/182590138",
      "https://www.openstreetmap.org/way/186352183",
      "https://www.openstreetmap.org/way/262284508",
      "https://www.openstreetmap.org/relation/10996236"
    ]
  },
  "rutgers-newark": {
    "bounds": [
      [
        40.7380405,
        -74.1778506
      ],
      [
        40.7456028,
        -74.170466
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/13105018"
    ]
  },
  "maryland-college-park": {
    "bounds": [
      [
        38.9671728,
        -76.9658076
      ],
      [
        39.0075665,
        -76.9184134
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/14718558"
    ]
  },
  "oregon-eugene": {
    "bounds": [
      [
        44.0392272,
        -123.0848606
      ],
      [
        44.0600238,
        -123.0607979
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/4770158"
    ]
  },
  "washington-seattle": {
    "bounds": [
      [
        47.6477824,
        -122.3218076
      ],
      [
        47.6660717,
        -122.2875884
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/5268488"
    ]
  },
  "ucla-westwood": {
    "bounds": [
      [
        34.0575332,
        -118.4553993
      ],
      [
        34.0780784,
        -118.4374163
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/7493269"
    ]
  },
  "usc-university-park": {
    "bounds": [
      [
        34.0183956,
        -118.2913926
      ],
      [
        34.0253619,
        -118.2789706
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/18383936"
    ]
  },
  "notre-dame-south-bend": {
    "bounds": [
      [
        41.6910575,
        -86.2505792
      ],
      [
        41.7161126,
        -86.2168296
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/16066037"
    ]
  },
  "alabama-tuscaloosa": {
    "bounds": [
      [
        33.2016136,
        -87.5536333
      ],
      [
        33.2225007,
        -87.5236724
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/89748187"
    ]
  },
  "georgia-athens": {
    "bounds": [
      [
        33.9006874,
        -83.4101959
      ],
      [
        33.9673594,
        -83.3434904
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/7301023"
    ]
  },
  "texas-austin": {
    "bounds": [
      [
        30.2749856,
        -97.785626
      ],
      [
        30.3973516,
        -97.7219658
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/1701848"
    ]
  },
  "florida-gainesville": {
    "bounds": [
      [
        29.6137737,
        -82.3745634
      ],
      [
        29.6520035,
        -82.3371689
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/18432136"
    ]
  },
  "virginia-tech-blacksburg": {
    "bounds": [
      [
        37.2092497,
        -80.4400394
      ],
      [
        37.2347283,
        -80.4118735
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/1214378"
    ]
  },
  "snhu-manchester": {
    "bounds": [
      [
        43.0309037,
        -71.4596783
      ],
      [
        43.0448196,
        -71.4398176
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/352883445"
    ]
  },
  "penn-state-harrisburg": {
    "bounds": [
      [
        40.1967208,
        -76.7563937
      ],
      [
        40.2093776,
        -76.7373766
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/way/38286830"
    ]
  },
  "minnesota-twin-cities": {
    "bounds": [
      [
        44.9570809,
        -93.2468353
      ],
      [
        44.9988646,
        -93.1679862
      ]
    ],
    "sources": [
      "https://www.openstreetmap.org/relation/2217609"
    ]
  }
}
