export const placeDeterminationCodes = [
  {
    code: "LMET",
    description: "Measured, surveying",
    descriptionNl: "Gemeten, landmeting",
  },
  { code: "LGPS", description: "Measured, GPS", descriptionNl: "Gemeten, GPS" },
  {
    code: "LDGM",
    description: "Measured, diff. GPS, > 5 m",
    descriptionNl: "Gemeten, diff. GPS, > 5 m",
  },
  {
    code: "LDGN",
    description: "Measured, diff. GPS, between 1 and 5 m",
    descriptionNl: "Gemeten, diff. GPS, 1 - < 5 m",
  },
  {
    code: "LDGZ",
    description: "Measured, diff. GPS, < 1m",
    descriptionNl: "Gemeten, diff. GPS, < 1m",
  },
  {
    code: "LGOV",
    description: "Measured, other methods",
    descriptionNl: "Gemeten, overige methoden",
  },
  {
    code: "LT10",
    description: "Estimated, Topographic map 1:10.000",
    descriptionNl: "Geschat, Topografische Kaart 1:10.000",
  },
  {
    code: "LT25",
    description: "Estimated, Topographic map 1:25.000",
    descriptionNl: "Geschat, Topografische Kaart 1:25.000",
  },
  {
    code: "LT50",
    description: "Estimated, Topographic map 1:50.000",
    descriptionNl: "Geschat, Topografische Kaart 1:50.000",
  },
  {
    code: "LD01",
    description: "Estimated, detailed map 1:100",
    descriptionNl: "Geschat, detailkaart 1:100",
  },
  {
    code: "LD02",
    description: "Estimated, detailed map 1:200",
    descriptionNl: "Geschat, detailkaart 1:200",
  },
  {
    code: "LD05",
    description: "Estimated, detailed map 1:500",
    descriptionNl: "Geschat, detailkaart 1:500",
  },
  {
    code: "LD10",
    description: "Estimated, detailed map 1:1000",
    descriptionNl: "Geschat, detailkaart 1:1000",
  },
  {
    code: "LD25",
    description: "Estimated, detailed map 1:2500",
    descriptionNl: "Geschat, detailkaart 1:2500",
  },
  {
    code: "LSOV",
    description: "Estimated, other methods",
    descriptionNl: "Geschat, overige methoden",
  },
  {
    code: "LONB",
    description: "Estimated, method unknown",
    descriptionNl: "Geschat, methode onbekend",
  },
];

export const heightDeterminationCodes = [
  {
    code: "MMET",
    description: "Measured, surveying",
    descriptionNl: "Gemeten, landmeting",
  },
  {
    code: "MDGP",
    description: "Measured, differential GPS",
    descriptionNl: "Gemeten, differentieel GPS",
  },
  {
    code: "MGOV",
    description: "Measured, other methods",
    descriptionNl: "Gemeten, overige methoden",
  },
  {
    code: "MH10",
    description: "Estimated, contour map 1:10.000",
    descriptionNl: "Geschat, Hoogtekaart 1:10.000",
  },
  {
    code: "MT25",
    description: "Estimated, Topographic map 1:25.000",
    descriptionNl: "Geschat, Topografische Kaart 1:25.000",
  },
  {
    code: "MT50",
    description: "Estimated, Topographic map 1:50.000",
    descriptionNl: "Geschat, Topografische Kaart 1:50.000",
  },
  {
    code: "MAHN",
    description: "Estimated, Actueel Hoogtebestand Nederland",
    descriptionNl: "Geschat, Actueel Hoogtebestand Nederland",
  },
  {
    code: "MSOV",
    description: "Estimated, other methods",
    descriptionNl: "Geschat, overige bepalingsmethoden",
  },
  {
    code: "MONB",
    description: "Estimated, unknown method",
    descriptionNl: "Geschat, methode onbekend",
  },
  {
    code: "MFIC",
    description: "Fictive value",
    descriptionNl: "Fictieve waarde",
  },
];

export const measurementVariables = [
  {
    id: 1,
    defaultValue: 1000,
    unit: "mm²",
    description: "Nominal surface area of cone tip",
    descriptionNl: "Nominaal oppervlak van conuspunt",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 2,
    defaultValue: 15000,
    unit: "mm²",
    description: "Nominal surface area of friction sleeve",
    descriptionNl: "Nominaal oppervlak van wrijvingsmantel",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 3,
    defaultValue: null,
    unit: "-",
    description: "Net surface area quotient of cone tip",
    descriptionNl: "Netto oppervlaktequotiënt van conuspunt",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 4,
    defaultValue: null,
    unit: "-",
    description: "Net surface area quotient of friction sleeve",
    descriptionNl: "Netto oppervlaktequotiënt van wrijvingsmantel",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 5,
    defaultValue: 100,
    unit: "mm",
    description: "Distance of cone to centre of friction sleeve",
    descriptionNl: "Afstand van conus tot midden wrijvingsmantel",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 6,
    defaultValue: null,
    unit: "-",
    description: "Friction present",
    descriptionNl: "Wrijving aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 7,
    defaultValue: null,
    unit: "-",
    description: "PPT u1 present",
    descriptionNl: "PPT u1 aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 8,
    defaultValue: null,
    unit: "-",
    description: "PPT u2 present",
    descriptionNl: "PPT u2 aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 9,
    defaultValue: null,
    unit: "-",
    description: "PPT u3 present",
    descriptionNl: "PPT u3 aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 10,
    defaultValue: null,
    unit: "-",
    description: "Inclination measurement present",
    descriptionNl: "Hellingsmeting aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 11,
    defaultValue: null,
    unit: "-",
    description: "Use of back-flow compensator",
    descriptionNl: "Gebruik van terugstroomcompensator",
    category: "equipment",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 12,
    defaultValue: null,
    unit: "-",
    description: "Type of cone penetration test",
    descriptionNl: "Type conuspenetratietest",
    category: "test_type",
    dataType: "enum",
    options: [
      { value: 0, meaning: "electronic penetration test" },
      { value: 1, meaning: "mechanical discontinue" },
      { value: 2, meaning: "mechanical continue" },
    ],
  },
  {
    id: 13,
    defaultValue: null,
    unit: "m",
    description: "Pre-excavated depth",
    descriptionNl: "Voorontgraven diepte",
    category: "site_conditions",
    dataType: "float",
  },
  {
    id: 14,
    defaultValue: null,
    unit: "m",
    description:
      "Groundwater level (with respect to datum of height system in ZID)",
    descriptionNl: "Grondwaterstand (t.o.v. datum van hoogtestelsel in ZID)",
    category: "site_conditions",
    dataType: "float",
  },
  {
    id: 15,
    defaultValue: null,
    unit: "m",
    description: "Water depth (for offshore activities)",
    descriptionNl: "Waterdiepte (voor offshore activiteiten)",
    category: "site_conditions",
    dataType: "float",
  },
  {
    id: 16,
    defaultValue: null,
    unit: "m",
    description: "End depth of penetration test",
    descriptionNl: "Einddiepte van penetratietest",
    category: "test_execution",
    dataType: "float",
  },
  {
    id: 17,
    defaultValue: null,
    unit: "-",
    description: "Stop criteria",
    descriptionNl: "Stopcriteria",
    category: "test_execution",
    dataType: "enum",
    options: [
      { value: 0, meaning: "end depth reached" },
      { value: 1, meaning: "max. penetration force" },
      { value: 2, meaning: "cone value" },
      { value: 3, meaning: "max. friction value" },
      { value: 4, meaning: "max. PPT value" },
      { value: 5, meaning: "max. inclination value" },
      { value: 6, meaning: "obstacle" },
      { value: 7, meaning: "danger of buckling" },
    ],
  },
  {
    id: 20,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement of cone before penetration test",
    descriptionNl: "Nulmeting van conus vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 21,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement of cone after penetration test",
    descriptionNl: "Nulmeting van conus na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 22,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement friction before penetration test",
    descriptionNl: "Nulmeting wrijving vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 23,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement friction after penetration test",
    descriptionNl: "Nulmeting wrijving na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 24,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u1 before penetration test",
    descriptionNl: "Nulmeting PPT u1 vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 25,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u1 after penetration test",
    descriptionNl: "Nulmeting PPT u1 na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 26,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u2 before penetration test",
    descriptionNl: "Nulmeting PPT u2 vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 27,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u2 after penetration test",
    descriptionNl: "Nulmeting PPT u2 na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 28,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u3 before penetration test",
    descriptionNl: "Nulmeting PPT u3 vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 29,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u3 after penetration test",
    descriptionNl: "Nulmeting PPT u3 na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 30,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination before penetration test",
    descriptionNl: "Nulmeting helling vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 31,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination after penetration test",
    descriptionNl: "Nulmeting helling na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 32,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination NS before penetration test",
    descriptionNl: "Nulmeting helling NZ vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 33,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination NS after penetration test",
    descriptionNl: "Nulmeting helling NZ na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 34,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination EW before penetration test",
    descriptionNl: "Nulmeting helling OW vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 35,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination EW after penetration test",
    descriptionNl: "Nulmeting helling OW na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 41,
    defaultValue: null,
    unit: "km",
    description: "Mileage",
    descriptionNl: "Kilometrering",
    category: "location",
    dataType: "float",
  },
  {
    id: 42,
    defaultValue: null,
    unit: "degrees",
    description: "Orientation between X axis inclination and North",
    descriptionNl: "Oriëntatie tussen X-as helling en Noord",
    category: "location",
    dataType: "float",
  },
] as const;

export const measurementTextVariables = [
  {
    id: 1,
    description: "Client",
    descriptionNl: "Opdrachtgever",
    category: "project_info",
    example: "ABC Engineering Company",
  },
  {
    id: 2,
    description: "Name of the project",
    descriptionNl: "Naam van het project",
    category: "project_info",
    example: "Highway A1 Extension",
  },
  {
    id: 3,
    description: "Name of the location",
    descriptionNl: "Naam van de locatie",
    category: "project_info",
    example: "Rotterdam Port Area",
  },
  // BORE-specific IDs (these overlap with CPT reserved IDs but have different meanings)
  {
    id: 5,
    description: "Date of bore description",
    descriptionNl: "Datum van boorbeschrijving",
    category: "test_info",
    example: "2001-11-14",
  },
  {
    id: 6,
    description: "Layer descriptor",
    descriptionNl: "Laagbeschrijver",
    category: "test_info",
    example: "J. van der Berg",
  },
  {
    id: 16,
    description: "Drilling date",
    descriptionNl: "Boordatum",
    category: "test_info",
    example: "2001-11-14",
  },
  {
    id: 31,
    description: "Drilling method segment 1",
    descriptionNl: "Boormethode traject 1",
    category: "equipment",
    example: "PUL",
  },
  {
    id: 32,
    description: "Drilling method segment 2",
    descriptionNl: "Boormethode traject 2",
    category: "equipment",
    example: "PUL",
  },
  {
    id: 33,
    description: "Drilling method segment 3",
    descriptionNl: "Boormethode traject 3",
    category: "equipment",
    example: "PUL",
  },
  {
    id: 34,
    description: "Drilling method segment 4",
    descriptionNl: "Boormethode traject 4",
    category: "equipment",
    example: "PUL",
  },
  {
    id: 35,
    description: "Drilling method segment 5",
    descriptionNl: "Boormethode traject 5",
    category: "equipment",
    example: "PUL",
  },
  {
    id: 4,
    description: "Cone type and serial number",
    descriptionNl: "Conustype en serienummer",
    category: "equipment",
    example: "Fugro Type A, Serial 12345",
  },
  {
    id: 5,
    description: "Mass and geometry of probe apparatus, including anchoring",
    descriptionNl:
      "Massa en geometrie van sondeerinstallatie, inclusief verankering",
    category: "equipment",
    example: "Mass: 2500kg, Length: 15m, Anchoring: hydraulic",
  },
  {
    id: 6,
    description: "Applied standard, including class",
    descriptionNl: "Toegepaste norm, inclusief klasse",
    category: "standards",
    example: "NEN 5140 Class 1, NEN 3680",
  },
  {
    id: 7,
    description: "Own coordinate system",
    descriptionNl: "Eigen coördinatenstelsel",
    category: "coordinates",
    example: "Local site grid, origin at building corner",
  },
  {
    id: 8,
    description: "Own reference level",
    descriptionNl: "Eigen referentieniveau",
    category: "coordinates",
    example: "Site datum +5.00m above MSL",
  },
  {
    id: 9,
    description: "Fixed horizontal level (usually: ground level or flow bed)",
    descriptionNl: "Vast horizontaal niveau (meestal: maaiveld of stroombed)",
    category: "coordinates",
    example: "+2.35m NAP",
  },
  {
    id: 10,
    description:
      "Orientation direction biaxial inclination measurement (N-direction)",
    descriptionNl: "Oriëntatierichting biaxiale hellingsmeting (N-richting)",
    category: "measurements",
    example: "North = 0°, magnetic declination +2°",
  },
  {
    id: 11,
    description: "Unusual circumstances",
    descriptionNl: "Bijzondere omstandigheden",
    category: "conditions",
    example: "Heavy rain during test, vibrations from nearby construction",
  },
  {
    id: 12,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 13,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 14,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 15,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 16,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 17,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 18,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 19,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 20,
    description: "Correction method for zero drift",
    descriptionNl: "Correctiemethode voor nuldrift",
    category: "processing",
    example: "Linear interpolation between pre/post zero measurements",
  },
  {
    id: 21,
    description: "Method for processing interruptions",
    descriptionNl: "Methode voor verwerking van onderbrekingen",
    category: "processing",
    example: "Data gap filled using adjacent measurements",
  },
  {
    id: 22,
    description: "Remarks",
    descriptionNl: "Opmerkingen",
    category: "general",
    example: "Test performed according to project specifications",
  },
  {
    id: 23,
    description: "Remarks",
    descriptionNl: "Opmerkingen",
    category: "general",
    example: "Groundwater encountered at 3.2m depth",
  },
  {
    id: 24,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 25,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 26,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 27,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 28,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 29,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 30,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Friction ratio = (fs/qc) × 100%",
  },
  {
    id: 31,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Corrected cone resistance = qc + u2(1-a)",
  },
  {
    id: 32,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Net cone resistance = qc - σvo",
  },
  {
    id: 33,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Pore pressure ratio = (u2 - u0) / (qc - σvo)",
  },
  {
    id: 34,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example:
      "Soil behavior type index = sqrt((3.47-log10(Qt))^2 + (log10(Fr)+1.22)^2)",
  },
  {
    id: 35,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Normalized cone resistance = (qc - σvo) / σ'vo",
  },
  {
    id: 36,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 37,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 38,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 39,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 40,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 41,
    description: "Highway, railway or dike code",
    descriptionNl: "Rijksweg-, spoorweg- of dijkcode",
    category: "infrastructure",
    example: "Railway line A16, km 23.4",
  },
  {
    id: 42,
    description: "Method for determination of ZID (height)",
    descriptionNl: "Methode voor bepaling van ZID (hoogte)",
    category: "coordinates",
    example: "MMET (Measured, surveying)",
    standardizedCodes: heightDeterminationCodes,
  },
  {
    id: 43,
    description: "Method for determination of XYID (position)",
    descriptionNl: "Methode voor bepaling van XYID (positie)",
    category: "coordinates",
    example: "LMET (Measured, surveying)",
    standardizedCodes: placeDeterminationCodes,
  },
  {
    id: 44,
    description: "Orientation of X axis of inclination measurement",
    descriptionNl: "Oriëntatie van X-as van hellingsmeting",
    category: "measurements",
    example: "X-axis aligned with magnetic north",
  },
] as const;

export type MeasurementVariable = (typeof measurementVariables)[number];
export type MeasurementTextVariable = (typeof measurementTextVariables)[number];

// =============================================================================
// DUTCH EXTENSIONS (BRO + VOTB)
// BRO: Basis Registratie Ondergrond - regulatory submission fields
// VOTB: Vereniging Ondernemers Technisch Bodemonderzoek - industry fields
// =============================================================================

export const dutchMeasurementTextVariables = [
  // BRO fields (101-114 submission, 115-128 registration tracking)
  {
    id: 101,
    description: "Data holder (bronhouder)",
    descriptionNl: "Bronhouder",
    category: "bro_submission",
    example: "Bronhouder, 52605825, 31",
  },
  {
    id: 102,
    description: "Delivery framework (kader aanlevering)",
    descriptionNl: "Kader aanlevering",
    category: "bro_submission",
    example: "opdracht publieke taakuitvoering",
  },
  {
    id: 103,
    description: "Investigation purpose (kader inwinning)",
    descriptionNl: "Kader inwinning",
    category: "bro_submission",
    example: "overig onderzoek",
  },
  {
    id: 104,
    description: "Location surveyor (uitvoerder locatiebepaling)",
    descriptionNl: "Uitvoerder locatiebepaling",
    category: "bro_submission",
    example: "24257098, 31",
  },
  {
    id: 105,
    description: "Location determination date (datum locatiebepaling)",
    descriptionNl: "Datum locatiebepaling",
    category: "bro_submission",
    example: "2019, 01, 29",
  },
  {
    id: 106,
    description: "Elevation surveyor (uitvoerder verticale positiebepaling)",
    descriptionNl: "Uitvoerder verticale positiebepaling",
    category: "bro_submission",
    example: "24257098, 31",
  },
  {
    id: 107,
    description:
      "Elevation determination date (datum verticale positiebepaling)",
    descriptionNl: "Datum verticale positiebepaling",
    category: "bro_submission",
    example: "2019, 01, 29",
  },
  {
    id: 108,
    description: "Surface conditions (hoedanigheid oppervlakte)",
    descriptionNl: "Hoedanigheid oppervlakte",
    category: "bro_submission",
    example: "verhard",
  },
  {
    id: 109,
    description: "Dissipation test performed (dissipatietest uitgevoerd)",
    descriptionNl: "Dissipatietest uitgevoerd",
    category: "bro_submission",
    example: "nee",
  },
  {
    id: 110,
    description: "Expert correction performed (expertcorrectie uitgevoerd)",
    descriptionNl: "Expertcorrectie uitgevoerd",
    category: "bro_submission",
    example: "ja",
  },
  {
    id: 111,
    description:
      "Additional investigation performed (aanvullend onderzoek uitgevoerd)",
    descriptionNl: "Aanvullend onderzoek uitgevoerd",
    category: "bro_submission",
    example: "nee",
  },
  {
    id: 112,
    description: "Reporting date (rapportagedatum onderzoek)",
    descriptionNl: "Rapportagedatum onderzoek",
    category: "bro_submission",
    example: "2019, 01, 31",
  },
  {
    id: 113,
    description: "Last processing date (datum laatste bewerking)",
    descriptionNl: "Datum laatste bewerking",
    category: "bro_submission",
    example: "2019, 01, 30",
  },
  {
    id: 114,
    description: "Investigation date (datum onderzoek)",
    descriptionNl: "Datum onderzoek",
    category: "bro_submission",
    example: "2019, 01, 29",
  },
  {
    id: 115,
    description: "Quality regime (kwaliteitsregime)",
    descriptionNl: "Kwaliteitsregime",
    category: "bro_registration",
    example: "IMBRO/A",
  },
  {
    id: 116,
    description: "Registration timestamp (tijdstip registratie object)",
    descriptionNl: "Tijdstip registratie object",
    category: "bro_registration",
    example: "2019-02-15T10:30:00",
  },
  {
    id: 117,
    description: "Registration status (registratiestatus)",
    descriptionNl: "Registratiestatus",
    category: "bro_registration",
    example: "voltooid",
  },
  {
    id: 118,
    description:
      "Registration completion timestamp (tijdstip voltooiing registratie)",
    descriptionNl: "Tijdstip voltooiing registratie",
    category: "bro_registration",
    example: "2019-02-15T10:30:00",
  },
  {
    id: 119,
    description: "Corrected indicator (gecorrigeerd)",
    descriptionNl: "Gecorrigeerd",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 120,
    description: "Last correction timestamp (tijdstip laatste correctie)",
    descriptionNl: "Tijdstip laatste correctie",
    category: "bro_registration",
    example: null,
  },
  {
    id: 121,
    description: "Under investigation (in onderzoek)",
    descriptionNl: "In onderzoek",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 122,
    description: "Under investigation since (in onderzoek sinds)",
    descriptionNl: "In onderzoek sinds",
    category: "bro_registration",
    example: null,
  },
  {
    id: 123,
    description: "Removed from registration (uit registratie genomen)",
    descriptionNl: "Uit registratie genomen",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 124,
    description: "Removal timestamp (tijdstip uit registratie genomen)",
    descriptionNl: "Tijdstip uit registratie genomen",
    category: "bro_registration",
    example: null,
  },
  {
    id: 125,
    description: "Re-registered (weer in registratie genomen)",
    descriptionNl: "Weer in registratie genomen",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 126,
    description:
      "Re-registration timestamp (tijdstip weer in registratie genomen)",
    descriptionNl: "Tijdstip weer in registratie genomen",
    category: "bro_registration",
    example: null,
  },
  {
    id: 127,
    description:
      "Standardized location reference system (gestandaardiseerde locatie referentiestelsel)",
    descriptionNl: "Gestandaardiseerde locatie referentiestelsel",
    category: "bro_registration",
    example: "EPSG:28992",
  },
  {
    id: 128,
    description: "Coordinate transformation (coördinaattransformatie)",
    descriptionNl: "Coördinaattransformatie",
    category: "bro_registration",
    example: "nee",
  },
  // VOTB fields (1100+)
  {
    id: 1100,
    description:
      "Filter material type for pore pressure filter (Type filtermateriaal voor waterspanningsfilter)",
    descriptionNl: "Type filtermateriaal voor waterspanningsfilter",
    category: "votb_equipment",
    example: "sintered steel",
  },
  {
    id: 1101,
    description: "Use of friction reducer (Gebruik kleefbreker)",
    descriptionNl: "Gebruik kleefbreker",
    category: "votb_equipment",
    example: "ja",
  },
  {
    id: 1102,
    description: "Type of friction reducer (Type kleefbreker)",
    descriptionNl: "Type kleefbreker",
    category: "votb_equipment",
    example: "mechanical",
  },
  {
    id: 1103,
    description:
      "Fluid type for wash boring (Type vloeistof bij spoelsondering)",
    descriptionNl: "Type vloeistof bij spoelsondering",
    category: "votb_equipment",
    example: "water",
  },
  {
    id: 1104,
    description: "Inclinometer position (Positie hellingmeter)",
    descriptionNl: "Positie hellingmeter",
    category: "votb_equipment",
    example: "in cone",
  },
  {
    id: 1105,
    description:
      "Dissipation test with closed pressure clamp (Dissipatietest met gesloten drukklem)",
    descriptionNl: "Dissipatietest met gesloten drukklem",
    category: "votb_test",
    example: "nee",
  },
  {
    id: 1106,
    description:
      "Postal code for project location (Postcode voor de projectlocatie)",
    descriptionNl: "Postcode voor de projectlocatie",
    category: "votb_location",
    example: "3011 AA",
  },
  {
    id: 1107,
    description:
      "Street name of project location (Straatnaam van de projectlocatie)",
    descriptionNl: "Straatnaam van de projectlocatie",
    category: "votb_location",
    example: "Coolsingel",
  },
  {
    id: 1108,
    description: "City of project location (Plaats van de projectlocatie)",
    descriptionNl: "Plaats van de projectlocatie",
    category: "votb_location",
    example: "Rotterdam",
  },
  {
    id: 1109,
    description:
      "Province of project location (Provincie waarin de projectlocatie is gelegen)",
    descriptionNl: "Provincie waarin de projectlocatie is gelegen",
    category: "votb_location",
    example: "Zuid-Holland",
  },
  {
    id: 1110,
    description: "Country of project (Land waar het project in is gelegen)",
    descriptionNl: "Land waar het project in is gelegen",
    category: "votb_location",
    example: "Nederland",
  },
] as const;

export const dutchMeasurementVariables = [
  // BRO measurement variables (101-130)
  {
    id: 101,
    unit: "m",
    description: "Penetration length (Sondeertrajectlengte)",
    descriptionNl: "Sondeertrajectlengte",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 102,
    unit: "m",
    description: "Depth (Diepte)",
    descriptionNl: "Diepte",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 103,
    unit: "s",
    description: "Elapsed time (Verlopen tijd)",
    descriptionNl: "Verlopen tijd",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 104,
    unit: "MPa",
    description: "Cone resistance (Conusweerstand)",
    descriptionNl: "Conusweerstand",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 105,
    unit: "MPa",
    description: "Corrected cone resistance (Gecorrigeerde conusweerstand)",
    descriptionNl: "Gecorrigeerde conusweerstand",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 106,
    unit: "MPa",
    description: "Net cone resistance (Netto conusweerstand)",
    descriptionNl: "Netto conusweerstand",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 107,
    unit: "nT",
    description: "Magnetic field strength x (Magnetische veldsterkte x)",
    descriptionNl: "Magnetische veldsterkte x",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 108,
    unit: "nT",
    description: "Magnetic field strength y (Magnetische veldsterkte y)",
    descriptionNl: "Magnetische veldsterkte y",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 109,
    unit: "nT",
    description: "Magnetic field strength z (Magnetische veldsterkte z)",
    descriptionNl: "Magnetische veldsterkte z",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 110,
    unit: "nT",
    description:
      "Total magnetic field strength (Totale magnetische veldsterkte)",
    descriptionNl: "Totale magnetische veldsterkte",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 111,
    unit: "S/m",
    description: "Electrical conductivity (Electrische geleidbaarheid)",
    descriptionNl: "Electrische geleidbaarheid",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 112,
    unit: "degrees",
    description: "Inclination east-west (Helling oost-west)",
    descriptionNl: "Helling oost-west",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 113,
    unit: "degrees",
    description: "Inclination north-south (Helling noord-zuid)",
    descriptionNl: "Helling noord-zuid",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 114,
    unit: "degrees",
    description: "Inclination x (Helling x)",
    descriptionNl: "Helling x",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 115,
    unit: "degrees",
    description: "Inclination y (Helling y)",
    descriptionNl: "Helling y",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 116,
    unit: "degrees",
    description: "Resultant inclination (Hellingresultante)",
    descriptionNl: "Hellingresultante",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 117,
    unit: "degrees",
    description: "Magnetic inclination (Magnetische inclinatie)",
    descriptionNl: "Magnetische inclinatie",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 118,
    unit: "degrees",
    description: "Magnetic declination (Magnetische declinatie)",
    descriptionNl: "Magnetische declinatie",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 119,
    unit: "MPa",
    description: "Local friction (Plaatselijke wrijving)",
    descriptionNl: "Plaatselijke wrijving",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 120,
    unit: "-",
    description: "Pore ratio (Porienratio)",
    descriptionNl: "Poriënratio",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 121,
    unit: "°C",
    description: "Temperature (Temperatuur)",
    descriptionNl: "Temperatuur",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 122,
    unit: "MPa",
    description: "Pore pressure u1 (Waterspanning u1)",
    descriptionNl: "Waterspanning u1",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 123,
    unit: "MPa",
    description: "Pore pressure u2 (Waterspanning u2)",
    descriptionNl: "Waterspanning u2",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 124,
    unit: "%",
    description: "Friction ratio (Wrijvingsgetal)",
    descriptionNl: "Wrijvingsgetal",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 130,
    unit: "mm",
    description: "Cone diameter before test (Conusdiameter voor test)",
    descriptionNl: "Conusdiameter voor test",
    category: "bro_equipment",
    dataType: "float",
  },
  // VOTB measurement variables (1100+)
  {
    id: 1100,
    unit: "µm",
    description:
      "Pore diameter of filter material (Poriendiameter filtermateriaal waterspanningsfilter)",
    descriptionNl: "Poriëndiameter filtermateriaal waterspanningsfilter",
    category: "votb_equipment",
    dataType: "float",
  },
  {
    id: 1101,
    unit: "mm",
    description:
      "Filter diameter behind cone tip (Diameter filter achter conuspunt)",
    descriptionNl: "Diameter filter achter conuspunt",
    category: "votb_equipment",
    dataType: "float",
  },
  {
    id: 1102,
    unit: "mm",
    description:
      "Distance friction reducer to cone tip (Afstand kleefbreker tot conuspunt)",
    descriptionNl: "Afstand kleefbreker tot conuspunt",
    category: "votb_equipment",
    dataType: "float",
  },
  {
    id: 1103,
    unit: "°C",
    description: "Cone temperature before test (Temperatuur conus voor test)",
    descriptionNl: "Temperatuur conus voor test",
    category: "votb_calibration",
    dataType: "float",
  },
  {
    id: 1104,
    unit: "°C",
    description:
      "Ambient temperature before test (Temperatuur omgeving voor test)",
    descriptionNl: "Temperatuur omgeving voor test",
    category: "votb_calibration",
    dataType: "float",
  },
] as const;

// =============================================================================
// BELGIAN EXTENSIONS (DOV - Databank Ondergrond Vlaanderen)
// =============================================================================

export const belgianMeasurementTextVariables = [
  {
    id: 135,
    description: "Cone calibration date (Conus calibratie datum)",
    descriptionNl: "Conus calibratie datum",
    category: "dov_calibration",
    example: "2019-01-15",
  },
  {
    id: 136,
    description: "Cone supplier (Leverancier conus)",
    descriptionNl: "Leverancier conus",
    category: "dov_equipment",
    example: "Fugro",
  },
  {
    id: 137,
    description:
      "Saturation method for U cone (Methode verzadiging voor U conus)",
    descriptionNl: "Methode verzadiging voor U conus",
    category: "dov_equipment",
    example: "glycerine",
  },
  {
    id: 138,
    description: "Cone type (Conustype)",
    descriptionNl: "Conustype",
    category: "dov_equipment",
    example: "electric",
  },
  {
    id: 139,
    description: "Filling of sounding hole (Opvullen van sondeergat)",
    descriptionNl: "Opvullen van sondeergat",
    category: "dov_execution",
    example: "ja",
  },
  {
    id: 140,
    description: "Remark: Deviations from standard (Afwijkingen van de norm)",
    descriptionNl: "Afwijkingen van de norm",
    category: "dov_remarks",
    example: "none",
  },
  {
    id: 141,
    description: "Remark: Reason for early stop (Reden vroegtijdig stoppen)",
    descriptionNl: "Reden vroegtijdig stoppen",
    category: "dov_remarks",
    example: "obstacle encountered",
  },
  {
    id: 142,
    description: "Remark: Resume sounding (Hernemen sondering)",
    descriptionNl: "Hernemen sondering",
    category: "dov_remarks",
    example: "resumed after repositioning",
  },
  {
    id: 143,
    description: "Remark: Special setups (Speciale opstellingen)",
    descriptionNl: "Speciale opstellingen",
    category: "dov_remarks",
    example: "platform mounted",
  },
  {
    id: 144,
    description:
      "Remark: Observation during execution (Waarneming tijdens uitvoering)",
    descriptionNl: "Waarneming tijdens uitvoering",
    category: "dov_remarks",
    example: "groundwater inflow observed",
  },
] as const;

export const belgianMeasurementVariables = [
  // Calibration zero points
  {
    id: 155,
    unit: "MPa",
    description: "Zero point Qt before measurement (Nulpunt Qt voor de meting)",
    descriptionNl: "Nulpunt Qt voor de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 156,
    unit: "MPa",
    description: "Zero point Qt after measurement (Nulpunt Qt na de meting)",
    descriptionNl: "Nulpunt Qt na de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 157,
    unit: "°C",
    description: "Zero point T before measurement (Nulpunt T voor de meting)",
    descriptionNl: "Nulpunt T voor de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 158,
    unit: "°C",
    description: "Zero point T after measurement (Nulpunt T na de meting)",
    descriptionNl: "Nulpunt T na de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  // Execution fields
  {
    id: 130,
    unit: "-",
    description: "Penetration (Indringing)",
    descriptionNl: "Indringing",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 131,
    unit: "m",
    description: "Sounding hole closure at (Dichtvallen sondeergat op)",
    descriptionNl: "Dichtvallen sondeergat op",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 132,
    unit: "m",
    description:
      "Depth of friction catcher placement (Diepte plaatsen kleefvanger)",
    descriptionNl: "Diepte plaatsen kleefvanger",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 133,
    unit: "m",
    description:
      "Depth of extension tube placement (Diepte plaatsen verlengbuis)",
    descriptionNl: "Diepte plaatsen verlengbuis",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 134,
    unit: "-",
    description: "Number of tubes (Aantal buizen)",
    descriptionNl: "Aantal buizen",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 135,
    unit: "m",
    description: "Measured sounding length (Gemeten sondeerlengte)",
    descriptionNl: "Gemeten sondeerlengte",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 138,
    unit: "kN",
    description:
      "Total push force at end of sounding (Totale drukkracht bij einde sondering)",
    descriptionNl: "Totale drukkracht bij einde sondering",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 139,
    unit: "-",
    description: "Cone penetrometer class (NBN EN ISO 22476-1:2023)",
    descriptionNl: "Conuspenetrometer klasse (NBN EN ISO 22476-1:2023)",
    category: "dov_equipment",
    dataType: "string",
  },
  // Calibration data
  {
    id: 140,
    unit: "kPa",
    description: "Max allowable measurement uncertainty qc",
    descriptionNl: "Max. toelaatbare meetonzekerheid qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 141,
    unit: "kPa/°C",
    description: "Ambient temperature stability qc",
    descriptionNl: "Omgevingstemperatuurstabiliteit qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 142,
    unit: "kPa/°C",
    description: "Fluctuating temperature stability qc",
    descriptionNl: "Wisselende temperatuurstabiliteit qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 143,
    unit: "kPa/N",
    description: "Cone load influence qc",
    descriptionNl: "Conusbelastingsinvloed qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 144,
    unit: "kPa",
    description: "Max allowable measurement uncertainty fs",
    descriptionNl: "Max. toelaatbare meetonzekerheid fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 145,
    unit: "kPa/°C",
    description: "Ambient temperature stability fs",
    descriptionNl: "Omgevingstemperatuurstabiliteit fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 146,
    unit: "kPa/°C",
    description: "Fluctuating temperature stability fs",
    descriptionNl: "Wisselende temperatuurstabiliteit fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 147,
    unit: "kPa/N",
    description: "Cone load influence fs",
    descriptionNl: "Conusbelastingsinvloed fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 148,
    unit: "kPa",
    description: "Max allowable measurement uncertainty u",
    descriptionNl: "Max. toelaatbare meetonzekerheid u",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 149,
    unit: "kPa/°C",
    description: "Ambient temperature stability u",
    descriptionNl: "Omgevingstemperatuurstabiliteit u",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 150,
    unit: "kPa/°C",
    description: "Fluctuating temperature stability u",
    descriptionNl: "Wisselende temperatuurstabiliteit u",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 151,
    unit: "kPa/N",
    description: "Cone load influence u",
    descriptionNl: "Conusbelastingsinvloed u",
    category: "dov_calibration",
    dataType: "float",
  },
  // Guide tubes (voerbuis) - pairs of from/to depths
  {
    id: 200,
    unit: "m",
    description: "Guide tube 1 to (voerbuis1 tot)",
    descriptionNl: "Voerbuis 1 tot",
    category: "dov_guide_tubes",
    dataType: "float",
  },
  {
    id: 201,
    unit: "m",
    description: "Guide tube 1 from (voerbuis1 op)",
    descriptionNl: "Voerbuis 1 op",
    category: "dov_guide_tubes",
    dataType: "float",
  },
  // Note: IDs 202-239 continue the pattern for guide tubes 2-20
  // Borings - pairs of from/to depths
  {
    id: 250,
    unit: "m",
    description: "Boring 0 from (boring0 van)",
    descriptionNl: "Boring 0 van",
    category: "dov_borings",
    dataType: "float",
  },
  {
    id: 251,
    unit: "m",
    description: "Boring 0 to (boring0 tot)",
    descriptionNl: "Boring 0 tot",
    category: "dov_borings",
    dataType: "float",
  },
  // Note: IDs 252-289 continue the pattern for borings 1-19
  // Retractions (optrekking) - depths
  {
    id: 300,
    unit: "m",
    description: "Retraction 1 (optrekking1)",
    descriptionNl: "Optrekking 1",
    category: "dov_retractions",
    dataType: "float",
  },
  // Note: IDs 301-349 continue the pattern for retractions 2-50
  // Stops (stopzetting) - depths
  {
    id: 350,
    unit: "m",
    description: "Stop 1 (stopzetting1)",
    descriptionNl: "Stopzetting 1",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 351,
    unit: "m",
    description: "Stop 2 (stopzetting2)",
    descriptionNl: "Stopzetting 2",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 352,
    unit: "m",
    description: "Stop 3 (stopzetting3)",
    descriptionNl: "Stopzetting 3",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 353,
    unit: "m",
    description: "Stop 4 (stopzetting4)",
    descriptionNl: "Stopzetting 4",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 354,
    unit: "m",
    description: "Stop 5 (stopzetting5)",
    descriptionNl: "Stopzetting 5",
    category: "dov_stops",
    dataType: "float",
  },
] as const;

// =============================================================================
// EXTENSION DETECTION AND LOOKUP
// =============================================================================

export type GefExtension = "standard" | "dutch" | "belgian";

/**
 * Detect which GEF extension is used based on file headers
 */
export function detectGefExtension(
  measurementTextIds?: Array<number>,
  measurementVarIds?: Array<number>
): GefExtension {
  const textIds = measurementTextIds ?? [];
  const varIds = measurementVarIds ?? [];

  // Dutch BRO fields (101-128) or VOTB fields (1100+)
  const hasDutchTextIds = textIds.some(
    (id) => (id >= 101 && id <= 128) || id >= 1100
  );
  const hasDutchVarIds = varIds.some(
    (id) => (id >= 101 && id <= 130) || id >= 1100
  );
  if (hasDutchTextIds || hasDutchVarIds) {
    return "dutch";
  }

  // Belgian DOV fields: MEASUREMENTTEXT (135-144), MEASUREMENTVAR (130-354)
  const hasBelgianTextIds = textIds.some((id) => id >= 135 && id <= 144);
  const hasBelgianVarIds = varIds.some(
    (id) => (id >= 130 && id <= 158) || (id >= 200 && id <= 354)
  );
  if (hasBelgianTextIds || hasBelgianVarIds) {
    return "belgian";
  }

  return "standard";
}

/**
 * Get all measurement text variables for a given extension
 */
export function getMeasurementTextVariablesForExtension(
  extension: GefExtension
) {
  const base = [...measurementTextVariables];

  if (extension === "dutch") {
    return [...base, ...dutchMeasurementTextVariables];
  }
  if (extension === "belgian") {
    return [...base, ...belgianMeasurementTextVariables];
  }

  return base;
}

/**
 * Get all measurement variables for a given extension
 */
export function getMeasurementVariablesForExtension(extension: GefExtension) {
  const base = [...measurementVariables];

  if (extension === "dutch") {
    return [...base, ...dutchMeasurementVariables];
  }
  if (extension === "belgian") {
    return [...base, ...belgianMeasurementVariables];
  }

  return base;
}

/**
 * Find a measurement text variable by ID, considering the extension
 */
export function findMeasurementTextVariable(
  id: number,
  extension: GefExtension
) {
  const variables = getMeasurementTextVariablesForExtension(extension);
  return variables.find((v) => v.id === id);
}

/**
 * Find a measurement variable by ID, considering the extension
 */
export function findMeasurementVariable(id: number, extension: GefExtension) {
  const variables = getMeasurementVariablesForExtension(extension);
  return variables.find((v) => v.id === id);
}

// Drilling method codes for GEF-BORE files (NEN 5104)
export const DRILLING_METHOD_CODES = {
  ACK: "Ackermann-steekboring",
  AVE: "Avegaarboring",
  AVH: "Holle avegaarboring",
  AVS: "Avegaar-steekboring",
  BES: "Begemann-steekboring",
  BEI: "Beitel",
  BSA: "Beeker-sampler",
  BEV: "Bevriezen",
  CFL: "Counter-flushboring",
  DRC: "Dropcorer",
  EDM: "Edelmanboring",
  GD1: "Geodoff 1 boring",
  GD2: "Geodoff 2 boring",
  GD3: "Geodoff 3 boring",
  GUT: "Guts",
  GRA: "Graven",
  HAH: "Hamon happer",
  HAN: "Handboring",
  HAP: "Hapmonster",
  KER: "Kernboring",
  LEP: "Lepelboring",
  LUC: "Luchtliftboring",
  LUH: "Luchthamer",
  ONT: "Ontsluiting",
  OSC: "Oscorer",
  PIS: "Pistoncorer",
  PUL: "Pulsboring",
  PUH: "Handpuls",
  PUK: "Pulsboring (lichte stelling)",
  PUM: "Pulsboring (mechanisch)",
  RAM: "Ramguts",
  RFL: "Ro-flushboring",
  RIV: "Riverside boring",
  SFC: "Straight-flushboring met core sampling",
  SFL: "Straight-flushboring",
  SLB: "Slibsteker",
  SPI: "Spiraalboring",
  SPO: "Spoelboring",
  SPS: "Spoelboring met steekmonsters",
  SPU: "Spuitboring",
  STE: "Steekboring",
  TRF: "Trilflipboring",
  TRI: "Trilboring",
  VDS: "Van der Staay boring",
  VVH: "Van Veen happer",
  VIB: "Vibrocorer",
  ZEN: "Zenkovitchboring",
  ZUI: "Zuigboring",
} as const;

type DrillingCode = keyof typeof DRILLING_METHOD_CODES;

/**
 * Decode a drilling method code
 * Returns formatted string like "Pulsboring (PUL)" or the original code if not found
 */
export function decodeDrillingMethod(code: string): string {
  const upperCode = code.trim().toUpperCase() as DrillingCode; // TODO better check
  const description = DRILLING_METHOD_CODES[upperCode];
  if (description) {
    return `${description} (${upperCode})`;
  }
  return code;
}

/**
 * Decode a standardized code for a measurement text variable
 * Returns formatted string like "Measured, surveying (MMET)" or the original text if no match
 */
export function decodeMeasurementText(
  id: number,
  text: string,
  extension: GefExtension = "standard"
): string {
  // Decode drilling method for BORE files (MEASUREMENTTEXT IDs 31-35 are boormethode for trajecten 1-5)
  if (id >= 31 && id <= 35) {
    return decodeDrillingMethod(text);
  }

  const variable = findMeasurementTextVariable(id, extension);
  if (!variable || !("standardizedCodes" in variable)) {
    return text;
  }

  const standardizedCodes = variable.standardizedCodes;
  const code = standardizedCodes.find(
    (c: { code: string; description: string }) =>
      c.code === text.trim().toUpperCase()
  );
  if (code) {
    return `${code.description} (${code.code})`;
  }

  return text;
}

export const columnQuantities = [
  {
    id: 1,
    name: "Penetration length",
    nameNl: "Sondeerlengte",
    unit: "m",
    description: "Depth of cone tip below fixed horizontal surface",
    descriptionNl: "Diepte van conuspunt onder vast horizontaal oppervlak",
    required: true,
    category: "primary",
    symbol: null,
  },
  {
    id: 2,
    name: "Measured cone resistance",
    nameNl: "Gemeten conusweerstand",
    unit: "MPa",
    description: "Direct cone tip resistance measurement",
    descriptionNl: "Directe conuspunt weerstandsmeting",
    required: true,
    category: "primary",
    symbol: "qc",
  },
  {
    id: 3,
    name: "Friction resistance",
    nameNl: "Wrijvingsweerstand",
    unit: "MPa",
    description: "Sleeve friction measurement",
    descriptionNl: "Mantelwrijvingsmeting",
    required: false,
    category: "friction",
    symbol: null,
  },
  {
    id: 4,
    name: "Friction number",
    nameNl: "Wrijvingsgetal",
    unit: "%",
    description: "Friction ratio percentage",
    descriptionNl: "Wrijvingsratio percentage",
    required: false,
    category: "friction",
    symbol: null,
  },
  {
    id: 5,
    name: "Pore pressure u1",
    nameNl: "Waterspanning u1",
    unit: "MPa",
    description: "Pore pressure at cone tip",
    descriptionNl: "Waterspanning bij conuspunt",
    required: false,
    category: "pore_pressure",
    symbol: "u1",
  },
  {
    id: 6,
    name: "Pore pressure u2",
    nameNl: "Waterspanning u2",
    unit: "MPa",
    description: "Pore pressure at cone shoulder",
    descriptionNl: "Waterspanning bij conusschouder",
    required: false,
    category: "pore_pressure",
    symbol: "u2",
  },
  {
    id: 7,
    name: "Pore pressure u3",
    nameNl: "Waterspanning u3",
    unit: "MPa",
    description: "Pore pressure at friction sleeve",
    descriptionNl: "Waterspanning bij wrijvingsmantel",
    required: false,
    category: "pore_pressure",
    symbol: "u3",
  },
  {
    id: 8,
    name: "Inclination (resultant)",
    nameNl: "Helling (resultante)",
    unit: "degrees",
    description: "Total inclination from vertical",
    descriptionNl: "Totale helling t.o.v. verticaal",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 9,
    name: "Inclination N-S",
    nameNl: "Helling N-Z",
    unit: "degrees",
    description: "North-South inclination component",
    descriptionNl: "Noord-Zuid hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 10,
    name: "Inclination E-W",
    nameNl: "Helling O-W",
    unit: "degrees",
    description: "East-West inclination component",
    descriptionNl: "Oost-West hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 11,
    name: "Corrected depth",
    nameNl: "Gecorrigeerde diepte",
    unit: "m",
    description: "Corrected depth below fixed horizontal surface",
    descriptionNl: "Gecorrigeerde diepte onder vast horizontaal oppervlak",
    required: false,
    category: "calculated",
    symbol: null,
  },
  {
    id: 12,
    name: "Time",
    nameNl: "Tijd",
    unit: "s",
    description: "Time of measurement",
    descriptionNl: "Tijd van meting",
    required: false,
    category: "measurement_info",
    symbol: null,
  },
  {
    id: 13,
    name: "Corrected cone resistance",
    nameNl: "Gecorrigeerde conusweerstand",
    unit: "MPa",
    description: "Cone resistance corrected for pore pressure effects",
    descriptionNl: "Conusweerstand gecorrigeerd voor waterspanningseffecten",
    required: false,
    category: "calculated",
    symbol: "qt",
  },
  {
    id: 14,
    name: "Net cone resistance",
    nameNl: "Netto conusweerstand",
    unit: "MPa",
    description: "Net cone resistance",
    descriptionNl: "Netto conusweerstand",
    required: false,
    category: "calculated",
    symbol: "qn",
  },
  {
    id: 15,
    name: "Pore ratio",
    nameNl: "Poriënratio",
    unit: "-",
    description: "Pore pressure ratio",
    descriptionNl: "Waterspanningsratio",
    required: false,
    category: "calculated",
    symbol: "Bq",
  },
  {
    id: 16,
    name: "Cone resistance number",
    nameNl: "Conusweerstandsgetal",
    unit: "-",
    description: "Normalized cone resistance",
    descriptionNl: "Genormaliseerde conusweerstand",
    required: false,
    category: "calculated",
    symbol: "Nm",
  },
  {
    id: 17,
    name: "Weight per unit volume",
    nameNl: "Volumegewicht",
    unit: "kN/m³",
    description: "Unit weight of soil",
    descriptionNl: "Volumegewicht van grond",
    required: false,
    category: "soil_properties",
    symbol: "γ",
  },
  {
    id: 18,
    name: "In-situ initial pore pressure",
    nameNl: "In-situ initiële waterspanning",
    unit: "MPa",
    description: "Initial pore water pressure",
    descriptionNl: "Initiële poriënwaterdruk",
    required: false,
    category: "soil_properties",
    symbol: "u0",
  },
  {
    id: 19,
    name: "Total vertical soil pressure",
    nameNl: "Totale verticale grondspanning",
    unit: "MPa",
    description: "Total overburden stress",
    descriptionNl: "Totale deklaagspanning",
    required: false,
    category: "soil_properties",
    symbol: "σv0",
  },
  {
    id: 20,
    name: "Effective vertical soil pressure",
    nameNl: "Effectieve verticale grondspanning",
    unit: "MPa",
    description: "Effective overburden stress",
    descriptionNl: "Effectieve deklaagspanning",
    required: false,
    category: "soil_properties",
    symbol: "σ'v0",
  },
  {
    id: 21,
    name: "Inclination in X direction",
    nameNl: "Helling in X-richting",
    unit: "degrees",
    description: "X-direction inclination component",
    descriptionNl: "X-richting hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 22,
    name: "Inclination in Y direction",
    nameNl: "Helling in Y-richting",
    unit: "degrees",
    description: "Y-direction inclination component",
    descriptionNl: "Y-richting hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 23,
    name: "Electric conductivity",
    nameNl: "Elektrische geleidbaarheid",
    unit: "S/m",
    description: "Electrical conductivity measurement",
    descriptionNl: "Elektrische geleidbaarheidsmeting",
    required: false,
    category: "additional_measurements",
    symbol: null,
  },
  {
    id: 24,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 25,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 26,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 27,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 28,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 29,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 30,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 31,
    name: "Magnetic field strength Bx",
    nameNl: "Magnetische veldsterkte Bx",
    unit: "nT",
    description: "Magnetic field strength in X direction",
    descriptionNl: "Magnetische veldsterkte in X-richting",
    required: false,
    category: "magnetic_measurements",
    symbol: "Bx",
  },
  {
    id: 32,
    name: "Magnetic field strength By",
    nameNl: "Magnetische veldsterkte By",
    unit: "nT",
    description: "Magnetic field strength in Y direction",
    descriptionNl: "Magnetische veldsterkte in Y-richting",
    required: false,
    category: "magnetic_measurements",
    symbol: "By",
  },
  {
    id: 33,
    name: "Magnetic field strength Bz",
    nameNl: "Magnetische veldsterkte Bz",
    unit: "nT",
    description: "Magnetic field strength in Z direction",
    descriptionNl: "Magnetische veldsterkte in Z-richting",
    required: false,
    category: "magnetic_measurements",
    symbol: "Bz",
  },
  {
    id: 34,
    name: "Total magnetic field strength",
    nameNl: "Totale magnetische veldsterkte",
    unit: "nT",
    description: "Total magnetic field strength",
    descriptionNl: "Totale magnetische veldsterkte",
    required: false,
    category: "magnetic_measurements",
    symbol: "Btot",
  },
  {
    id: 35,
    name: "Magnetic inclination",
    nameNl: "Magnetische inclinatie",
    unit: "degrees",
    description: "Magnetic field inclination angle",
    descriptionNl: "Magnetische veld inclinatiehoek",
    required: false,
    category: "magnetic_measurements",
    symbol: null,
  },
  {
    id: 36,
    name: "Magnetic declination",
    nameNl: "Magnetische declinatie",
    unit: "degrees",
    description: "Magnetic field declination angle",
    descriptionNl: "Magnetische veld declinatiehoek",
    required: false,
    category: "magnetic_measurements",
    symbol: null,
  },
] as const;
