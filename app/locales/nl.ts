export default {
  translation: {
    // App title and description
    appTitle: "Bedrock.engineer GEF Viewer",
    appDescription:
      "Bekijk en analyseer GEF (Geotechnical Exchange Format) bestanden voor CPT, dissipatietesten, geotechnische boringen in je browser.",
    privacyNote: "Je gegevens verlaten nooit je browser.",
    offlineNote: "Deze app werkt ook offline.",
    installInstructionsDesktop:
      "Klik op het installatie-icoon in de adresbalk om te installeren.",
    installInstructionsIOS:
      "Tik op Deel, dan 'Zet op beginscherm' om te installeren.",
    installInstructionsAndroid: "Tik op het menu (⋮), dan 'App installeren'.",

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

    // Header validation warnings
    missingZidHeader:
      "Bestand '{{filename}}' mist ZID header (hoogtestelsel). Standaard ingesteld op 'Normaal Amsterdams Peil'. Dit kan de hoogte berekeningen en verticale positionering van metingen beïnvloeden.",
    unknownHeightSystem:
      "Bestand '{{filename}}' bevat onbekende hoogtestelsel code \"{{heightCode}}\". Standaard ingesteld op 'Normaal Amsterdams Peil'. Dit kan leiden tot onjuiste hoogte berekeningen.",
    zidWithoutHeight:
      "Bestand '{{filename}}' heeft een ZID header zonder hoogtewaarde. Maaiveldniveau standaard ingesteld op 0m. Dit beïnvloedt diepte-naar-hoogte conversies en kan leiden tot onjuiste maaiveldmetingen.",
    missingXyidHeader:
      "Bestand '{{filename}}' mist XYID header (coördinaat informatie). Locatie is onbekend, kan niet op de kaart weergeven of converteren naar WGS84.",
    missingColumnInfoQuantity:
      "Bestand '{{filename}}' heeft {{count}} COLUMNINFO {{entry}} die het quantity nummer missen (4e element volgens GEF spec). Standaard ingesteld op quantity 0 (onbekend). Dit kan ervoor zorgen dat data kolommen verkeerd worden geïnterpreteerd of niet correct worden weergegeven.",
    missingColumnInfoQuantity_entry: "item",
    missingColumnInfoQuantity_entry_plural: "items",
    sieveTestNotSupported: "GEF-SIEVE bestanden worden niet ondersteund",

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
    downloadJson: "Download JSON",
    downloadCsvTooltip: "Download alleen data als CSV",
    downloadJsonTooltip: "Download data en metadata als JSON",
    name: "Naam",
    unit: "Eenheid",

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
    measurementCode: "Beschrijfmethode",
    fileDate: "Bestandsdatum",
    fileOwner: "Bestandseigenaar",
    operatingSystem: "Besturingssysteem",
    extensionType: "Extensietype",
    comment: "Opmerking",

    // DISS-specific
    parentCpt: "Bijbehorende CPT",
    dissipationDepth: "Testdiepte:",
    porePressure: "Waterspanning",
    coneResistance: "Conusweerstand",

    // Plot labels
    columns: "Kolommen",
    yAxisVertical: "Y-as (Verticaal)",
    boreLog: "Boorstaat",
    graphs: "Grafieken",
    legend: "Legenda",
    depthM: "Diepte (m)",
    downloadSvg: "Download SVG",
    downloadPng: "Download PNG",
    madeWithBedrockGefViewer: "Gemaakt met Bedrock GEF Viewer",
    selectDownloadFormat: "Select download format",

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
    diameterSampleMm: "Ø Monster (mm)",
    diameterApparatusMm: "Ø Apparaat (mm)",
    dateTime: "Datum/Tijd",
    sampleCondition: "Toestand",
    apparatusType: "Apparaat",
    wallMethod: "Wand/Methode",

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
    about: "Over",
    contact: "Contact",
    feedbackOrRequests: "Bugs, feedback of verzoeken?",
    needSimilarApp:
      "Heb je een vergelijkbare app nodig voor je geotechnische workflow?",
    contactUs: "Neem contact op",

    // Empty state CTA
    freeToolByBedrock: "Gratis tool van Bedrock.engineer. Wij bouwen:",
    customWebApps: "Webapps op maat voor geotechnische workflows",
    pythonAutomation: "Geotechnische workflow automatisering met Python",
    bimCadIntegrations:
      "Geotechnische data-integratie in BIM software zoals Civil3D, Revit, Rhino3D, en Grashopper",
    emptyStateContact: "Geïnteresseerd?",

    // Disclaimer
    disclaimer:
      "Deze tool is bedoeld voor informatieve doeleinden. Alle geotechnische gegevens dienen te worden geverifieerd door een bevoegd geotechnisch specialist. Aan het gebruik kunnen geen rechten worden ontleend.",

    childGefFiles: "Child GEF bestanden",
    childGefFile: "Child GEF bestand",
    childGefFilesCount: "{{count}} child bestand",
    childGefFilesCount_plural: "{{count}} child bestanden",
    dissTests: "Dissipatie testen:",
    reference: "Referentie",
    description: "Beschrijving",
  },
} as const;
