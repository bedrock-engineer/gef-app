export default {
  translation: {
    // App title and description
    appTitle: "Bedrock GEF Bestand Viewer",
    appDescription:
      "Bekijk en analyseer GEF (Geotechnical Exchange Format) bestanden voor CPT en boorgatgegevens in je browser.",
    privacyNote:
      "Gegevens verlaten nooit uw browser, ze worden niet naar een server verzonden.",

    // File actions
    chooseFiles: "Kies GEF bestanden",
    dropFilesHere: "Sleep GEF bestanden hierheen",
    loadSampleFiles: "laad voorbeeldbestanden",
    clearAllFiles: "Alle bestanden wissen",
    removeFile: "Bestand verwijderen",
    processingFiles: "Bestanden verwerken...",
    or: "of",

    // Errors and warnings
    failedToParse: "Kon {{count}} bestand niet parsen:",
    failedToParse_plural: "Kon {{count}} bestanden niet parsen:",
    warning: "{{count}} waarschuwing:",
    warning_plural: "{{count}} waarschuwingen:",

    // Location
    location: "Locatie",
    allLocations: "Alle Locaties",

    // Header labels
    unknownTest: "Onbekende Test",
    date: "Datum:",
    boringDate: "Datum boring:",
    placeName: "Plaatsnaam:",
    drillingCompany: "Boorbedrijf:",
    layerDescriber: "Beschrijver lagen:",
    locationLabel: "Locatie:",
    groundLevel: "Maaiveld:",
    waterLevel: "Waterstand:",
    depth: "Diepte:",
    scanNumber: "Scan #:",
    downloadCsv: "Download CSV",

    // Copy buttons
    copyTestId: "Test ID kopiëren",
    copyProjectId: "Project ID kopiëren",
    copyDate: "Datum kopiëren",
    copyCoordinates: "Coördinaten kopiëren",
    copyWgs84: "WGS84 coördinaten kopiëren",
    copyElevation: "Hoogte kopiëren",
    copyWaterLevel: "Waterstand kopiëren",

    // Technical details sections
    technicalDetails: "Technische Details",
    projectInformation: "Projectinformatie",
    testInformation: "Testinformatie",
    coordinatesLocation: "Coördinaten & Locatie",
    equipmentCapabilities: "Apparatuur & Mogelijkheden",
    testConditionsRemarks: "Testcondities & Opmerkingen",
    dataProcessing: "Gegevensverwerking",
    calculationsFormulas: "Berekeningen & Formules",
    dataStructure: "Gegevensstructuur",
    calibrationData: "Kalibratiegegevens",
    fileMetadata: "Bestandsmetadata",
    comments: "Opmerkingen",
    extension: "Extensie",

    // Technical detail labels
    projectId: "Project ID",
    testId: "Test ID",
    company: "Bedrijf",
    address: "Adres",
    country: "Land",
    countryNetherlands: "Nederland",
    countryBelgium: "België",
    countryGermany: "Duitsland",
    startDate: "Startdatum",
    startTime: "Starttijd",
    coordinateSystem: "Coördinatenstelsel",
    xCoordinate: "X Coördinaat",
    yCoordinate: "Y Coördinaat",
    heightSystem: "Hoogtestelsel",
    surfaceLevel: "Maaiveldniveau",
    numberOfColumns: "Aantal kolommen",
    numberOfScans: "Aantal scans",
    dataFormat: "Gegevensformaat",
    dataColumns: "Gegevenskolommen",
    gefVersion: "GEF Versie",
    reportCode: "Rapportcode",
    fileDate: "Bestandsdatum",
    fileOwner: "Bestandseigenaar",
    operatingSystem: "Besturingssysteem",
    extensionType: "Extensietype",
    comment: "Opmerking",

    // Plot labels
    columns: "Kolommen",
    yAxisVertical: "Y-as (Verticaal)",
    boreLog: "Boorstaat",
    legend: "Legenda",
    depthM: "Diepte (m)",
    downloadSvg: "Download SVG",
    downloadPng: "Download PNG",

    // Soil types
    sand: "Zand",
    clay: "Klei",
    peat: "Veen",
    silt: "Leem",
    gravel: "Grind",
    notDescribed: "Niet beschreven",

    // Specimen table
    specimens: "Monsters",
    specimensCount: "Monsters ({{count}})",
    remarks: "Opmerkingen:",
    number: "Nr",
    code: "Code",
    depthM_table: "Diepte (m)",
    diameterMm: "Diameter (mm)",
    dateTime: "Datum/Tijd",
    type: "Type",
    method: "Methode",

    // Pre-excavation
    preExcavation: "Voorontgraving",
    preExcavationDescription: "Grond verwijderd vóór sonderen",

    // Copy
    copy: "Kopiëren",

    // Column min/max
    min: "Min",
    max: "Max",
    range: "Bereik",

    // Map
    loadingMap: "Kaart laden...",
    noValidLocations: "Geen geldige locaties om weer te geven",
    noLocationData: "Geen GEF-bestanden met locatiegegevens",
    unknownCoordinateSystem: "Onbekend",

    // File table columns
    filename: "Bestandsnaam",
    testDate: "Testdatum",

    // Empty state
    uploadGefFile: "Upload een GEF-bestand om te beginnen",

    // Download
    downloadLocationsGeoJson: "Download locaties als GeoJSON",

    // Footer
    feedbackOrRequests: "Feedback of verzoeken?",
    needSimilarApp:
      "Heeft u een vergelijkbare app nodig voor uw geotechnische workflow?",
    contactUs: "Neem contact op",

    // Empty state CTA
    freeToolByBedrock: "Gratis tool van Bedrock. Wij bouwen:",
    customWebApps: "Webapps op maat voor geotechnische workflows",
    pythonAutomation:
      "Geotechnische workflow automatisering met Python en Marimo notebooks",
    bimCadIntegrations:
      "Geotechnische data-integratie in BIM software zoals Civil3D, Revit, en Rhino3D",
    emptyStateContact: "Geïnteresseerd?",
  },
} as const;
