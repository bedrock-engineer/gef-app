export default {
  translation: {
    // App title and description
    appTitle: "Bedrock.engineer GEF Viewer",
    appDescription:
      "View and analyze GEF (Geotechnical Exchange Format) files for CPT and borehole data in your browser.",
    privacyNote: "Your data never leaves your browser.",
    offlineNote: "This app also works offline.",
    installInstructionsDesktop:
      "Click the install icon in your browser's address bar to install.",
    installInstructionsIOS: "Tap Share, then 'Add to Home Screen' to install.",
    installInstructionsAndroid: "Tap the menu (⋮), then 'Install app'.",

    // File actions
    chooseFiles: "Choose GEF files",
    dropFilesHere: "Drop GEF files here",
    loadSampleFiles: "load sample files",
    clearAllFiles: "Clear all files",
    removeFile: "Remove file",
    processingFiles: "Processing files...",
    or: "or",

    // Errors and warnings
    failedToParse: "Failed to parse {{count}} file:",
    failedToParse_plural: "Failed to parse {{count}} files:",
    warning: "{{count}} warning:",
    warning_plural: "{{count}} warnings:",

    // Header validation warnings
    missingZidHeader:
      "File '{{filename}}' missing ZID header (height reference system). Defaulting to 'Normaal Amsterdams Peil'. This may affect elevation calculations and vertical positioning of measurements.",
    unknownHeightSystem:
      "File '{{filename}}' contains unknown height system code \"{{heightCode}}\". Defaulting to 'Normaal Amsterdams Peil'. This may cause incorrect elevation calculations.",
    zidWithoutHeight:
      "File '{{filename}}' has ZID header without height value. Defaulting surface elevation to 0m. This will affect depth-to-elevation conversions and may produce incorrect ground level readings.",
    missingXyidHeader:
      "File '{{filename}}' missing XYID header (coordinate information). Location is unknown, cannot display on map or convert to WGS84.",
    missingColumnInfoQuantity:
      "File '{{filename}}' has {{count}} COLUMNINFO {{entry}} missing quantity number (4th element per GEF spec). Defaulting to quantity 0 (unknown). This may cause data columns to be misinterpreted or not displayed correctly.",
    missingColumnInfoQuantity_entry: "entry",
    missingColumnInfoQuantity_entry_plural: "entries",
    dissipationTestNotSupported:
      "GEF-DISS-Report (dissipation test) files are not supported",
    sieveTestNotSupported: "GEF-SIEVE files are not supported",
    name: "Name",
    unit: "Unit",

    // Location
    location: "Location",
    allLocations: "All Locations",

    // Header labels
    unknownTest: "Unknown Test",
    date: "Date:",
    boringDate: "Boring date:",
    placeName: "Place:",
    drillingCompany: "Drilling company:",
    layerDescriber: "Layer describer:",
    locationLabel: "Location:",
    groundLevel: "Ground level:",
    waterLevel: "Water level:",
    depth: "Depth:",
    scanNumber: "Scan #:",
    downloadCsv: "Download CSV",
    downloadJson: "Download JSON",
    downloadCsvTooltip: "Download data only as CSV",
    downloadJsonTooltip: "Download data and metadata as JSON",

    // Copy buttons
    copyTestId: "Copy Test ID",
    copyProjectId: "Copy Project ID",
    copyDate: "Copy Date",
    copyCoordinates: "Copy coordinates",
    copyWgs84: "Copy WGS84 coordinates",
    copyElevation: "Copy elevation",
    copyWaterLevel: "Copy water level",

    // Technical details sections
    technicalDetails: "Technical Details",
    projectInformation: "Project Information",
    testInformation: "Test Information",
    coordinatesLocation: "Coordinates & Location",
    equipmentCapabilities: "Equipment & Capabilities",
    testConditionsRemarks: "Test Conditions & Remarks",
    dataProcessing: "Data Processing",
    calculationsFormulas: "Calculations & Formulas",
    dataStructure: "Data Structure",
    calibrationData: "Calibration Data",
    fileMetadata: "File Metadata",
    comments: "Comments",
    extension: "Extension",

    // Technical detail labels
    projectId: "Project ID",
    testId: "Test ID",
    company: "Company",
    address: "Address",
    country: "Country",
    countryNetherlands: "Netherlands",
    countryBelgium: "Belgium",
    countryGermany: "Germany",
    startDate: "Start Date",
    startTime: "Start Time",
    coordinateSystem: "Coordinate System",
    xCoordinate: "X Coordinate",
    yCoordinate: "Y Coordinate",
    heightSystem: "Height System",
    surfaceLevel: "Surface Level",
    numberOfColumns: "Number of Columns",
    numberOfScans: "Number of Scans",
    dataFormat: "Data Format",
    dataColumns: "Data Columns",
    gefVersion: "GEF Version",
    reportCode: "Report Code",
    measurementCode: "Measurement Code",
    fileDate: "File Date",
    fileOwner: "File Owner",
    operatingSystem: "Operating System",
    extensionType: "Extension Type",
    comment: "Comment",

    // Plot labels
    columns: "Columns",
    yAxisVertical: "Y-Axis (Vertical)",
    boreLog: "Borehole Log",
    graphs: "Graphs",
    legend: "Legend",
    depthM: "Depth (m)",
    downloadSvg: "Download SVG",
    downloadPng: "Download PNG",
    madeWithBedrockGefViewer: "Made with Bedrock GEF Viewer",

    selectDownloadFormat: "Selecteer download formaat",

    // Soil types
    sand: "Sand",
    clay: "Clay",
    peat: "Peat",
    silt: "Silt",
    gravel: "Gravel",
    notDescribed: "Not described",

    // Specimen table
    specimens: "Specimens",
    specimensCount: "Specimens ({{count}})",
    remarks: "Remarks:",
    number: "#",
    code: "Code",
    depthM_table: "Depth (m)",
    diameterSampleMm: "Ø Sample (mm)",
    diameterApparatusMm: "Ø Apparatus (mm)",
    dateTime: "Date/Time",
    sampleCondition: "Condition",
    apparatusType: "Apparatus",
    wallMethod: "Wall/Method",

    // Pre-excavation
    preExcavation: "Pre-excavation",
    preExcavationDescription: "Soil removed before cone penetration testing",

    // Copy
    copy: "Copy",

    // Column min/max
    min: "Min",
    max: "Max",
    range: "Range",

    // Map
    loadingMap: "Loading map...",
    noValidLocations: "No valid locations to display",
    noLocationData: "No GEF files with location data",
    unknownCoordinateSystem: "Unknown",

    // File table columns
    filename: "Filename",
    testDate: "Test Date",

    // Empty state
    uploadGefFile: "Upload a GEF file to get started",

    // Download
    downloadLocationsGeoJson: "Download locations as GeoJSON",

    // Footer
    about: "About",
    contact: "Contact",
    feedbackOrRequests: "Bugs, feedback or requests?",
    needSimilarApp: "Need a similar app for your geotechnical workflow?",
    contactUs: "Contact us",

    // Empty state CTA
    freeToolByBedrock: "Free tool by Bedrock.engineer. We build:",
    customWebApps: "Custom web apps for geotechnical workflows",
    pythonAutomation: "Geotechnical workflow automation using Python",
    bimCadIntegrations:
      "Geotechnical data integration into BIM software like Civil3D, Revit, Rhino3D, and Grasshopper",
    emptyStateContact: "Interested?",

    // Disclaimer
    disclaimer:
      "This tool is provided for informational purposes only. All geotechnical data should be verified by a qualified geotechnical professional. No rights can be derived from the use of this tool.",
  },
} as const;
