export default {
  translation: {
    // App title and description
    appTitle: "Bedrock GEF File Viewer",
    appDescription: "View and analyze GEF (Geotechnical Exchange Format) files for CPT and borehole data in your browser.",
    privacyNote: "Data never leaves your browser, it is not sent to any server.",

    // File actions
    chooseFiles: "Choose GEF files",
    dropFilesHere: "Drop GEF files here",
    loadSampleFiles: "load sample files",
    clearAllFiles: "Clear all files",
    processingFiles: "Processing files...",
    or: "or",

    // Errors and warnings
    failedToParse: "Failed to parse {{count}} file:",
    failedToParse_plural: "Failed to parse {{count}} files:",
    warning: "{{count}} warning:",
    warning_plural: "{{count}} warnings:",

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
    fileDate: "File Date",
    fileOwner: "File Owner",
    operatingSystem: "Operating System",
    extensionType: "Extension Type",
    comment: "Comment",

    // Plot labels
    columns: "Columns",
    yAxisVertical: "Y-Axis (Vertical)",
    boreLog: "Borehole Log",
    legend: "Legend",
    depthM: "Depth (m)",
    downloadSvg: "Download SVG",
    downloadPng: "Download PNG",

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
    diameterMm: "Diameter (mm)",
    dateTime: "Date/Time",
    type: "Type",
    method: "Method",

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

    // Footer
    feedbackOrRequests: "Feedback or requests?",
  }
} as const;
