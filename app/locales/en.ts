export default {
  translation: {
    // App title and description
    appTitle: "Bedrock GEF Viewer",
    appDescription: "View and analyze GEF (Geotechnical Exchange Format) files for CPT and borehole data.",
    privacyNote: "Data never leaves your browser, it is not sent to any server",

    // File actions
    chooseFiles: "Choose GEF Files",
    dropFilesHere: "Or drop them here",
    loadSampleFiles: "load sample files",
    clearAllFiles: "Clear all files",
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
  }
} as const;
