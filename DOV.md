# DOV-GEF Format: Belgium's Geotechnical Data Standard

The DOV-GEF (Database Ondergrond Vlaanderen - Geotechnical Exchange Format) represents a crucial standardization initiative in Belgium's Flemish region, extending the international GEF format with Belgian-specific requirements for geotechnical data exchange. This specialized format serves as the backbone for Belgium's comprehensive subsurface data management system, with mandatory usage requirements and significant business implications for international firms operating in the Belgian geotechnical market.

## Database Ondergrond Vlaanderen: Belgium's geological data powerhouse

**Database Ondergrond Vlaanderen (DOV)** operates as a collaborative initiative within the Flemish Government, established in 1996 to manage and disseminate comprehensive subsurface data for Flanders. The organization represents a unique multi-agency partnership between three primary departments: the **Vlaamse Milieumaatschappij (VMM)** managing groundwater data, the **Vlaams Planbureau voor Omgeving (VPO)** coordinating geological information, and the **Departement Mobiliteit en Openbare Werken** handling geotechnical data.

Since its establishment, DOV has evolved from a simple data repository into a sophisticated geological data platform serving over 150,000 boreholes with lithological descriptions and 75,000+ soundings. The organization's mission centers on ensuring all subsurface data from Flanders remains readily available through a single portal, supporting everything from infrastructure development to environmental management.

DOV's evolution reflects Belgium's federal-regional administrative structure, where geological data management operates distinctly from Dutch centralized approaches. **A 2023 cooperation protocol added the Openbare Vlaamse Afvalstoffenmaatschappij (OVAM) as a fourth partner**, expanding DOV's scope to include soil contamination and displacement data, demonstrating the system's continued growth and adaptation to regional needs.

## Technical specifications reveal Belgian adaptations

DOV-GEF extends the standard **GEF-CPT-Report format** with specific Belgian additions designated as **"DOV-Toevoeging" (DOV additions)** while maintaining compatibility with international GEF processing tools. These extensions address Belgian regulatory requirements, coordinate systems, and geological practices that differ from standard Dutch implementations.

The format requires **Lambert 72 (EPSG:31370) coordinate system** specifications, Belgium's national projection system based on the Reseau National Belge 1972 datum. Technical parameters include specific false easting (150000.013 m) and false northing (5400088.438 m) values, with coverage limited to Belgium's onshore applications. This coordinate system integration ensures seamless compatibility with Belgian geographical information systems and regulatory frameworks.

**Key technical differences from standard GEF** include specialized quantity numbers (Qt uses quantity number 128 in DOV format), mandatory unique test numbers (sondeernummer), and enhanced metadata requirements for data provenance tracking. The format supports standard CPT parameters like cone resistance (qc), sleeve friction (fs), and pore water pressure (u2), while adding DOV-specific validation rules and schemas.

File structure follows ASCII text format with header sections containing project identification, file dates, and column information, followed by structured data sections with depth-based measurements typically at 1 cm intervals. **All depths are calculated relative to Belgian reference levels (TAW - Tweede Algemene Waterpassing)**, ensuring consistency with Belgian surveying standards.

## Current usage driven by regulatory requirements

**Since 2017, all accredited drilling companies in Flanders must submit drilling reports to DOV every two months**, creating mandatory market adoption through VLAREL (Flemish regulation) compliance requirements. This legal framework has significantly increased DOV-GEF adoption across Belgium's geotechnical sector, affecting drilling contractors, engineering consultants, government agencies, and research institutions.

Current usage encompasses thousands of drilling reports submitted bi-monthly, with extensive historical data conversion from older formats. The system serves as the primary data source for Belgium's 3D geological mapping programs and provides the foundation for preliminary design and analysis of geotechnical parameters in major infrastructure projects.

**Software support remains limited compared to standard GEF format**, creating implementation challenges for international firms. While most major geotechnical software packages support standard GEF import/export, DOV-GEF's additional tags require specific configurations or customizations. Users often need conversion tools or manual data manipulation to achieve full compatibility with commercial software platforms.

The format integrates extensively with Belgian geological databases through XML-based data exchange capabilities, WFS/WMS web services, and RESTful API endpoints. DOV provides online validation tools and technical support through specialized contact channels, supporting the growing user base across Belgium's geotechnical sector.

## Format relationships show regional specialization

DOV-GEF's relationship to other geotechnical formats reveals **strong compatibility with standard Dutch GEF while maintaining distinct Belgian characteristics**. The format builds upon the established GEF standard developed by GEONET (Dutch national geotechnical organization) but includes region-specific extensions that address Belgian regulatory and technical requirements.

**Conversion capabilities exist through specialized tools** including GEF-NENGEO converters, Excel-based conversion utilities, and the GEF2.dll library for custom implementations. These tools enable data exchange between DOV-GEF and standard GEF formats, supporting cross-border collaboration and international project requirements.

European geotechnical standards like the UK's AGS format serve similar purposes but use different data structures, creating interoperability challenges. **No direct conversion tools exist between DOV-GEF and AGS formats**, though both are text-based formats that could theoretically be converted through custom development. The **OGC Geotech Interoperability Experiment** currently evaluates integration possibilities between different geotechnical data standards and Building Information Modeling (BIM) environments.

Regional variations demonstrate the format's adaptability, with Netherlands maintaining standard GEF through GEONET, Belgium implementing DOV-GEF extensions, and other countries developing national variations. Standards bodies including CUR (Netherlands), DOV (Belgium), and AGS (UK) coordinate format development, while EU initiatives like the INSPIRE Directive promote broader interoperability.

## Business implications create market requirements

**Market adoption in Belgium/Flanders occurs primarily through regulatory mandate rather than market demand**, with significant implications for international firms seeking Belgian market access. The DOV-GEF format represents an essential requirement for participating in Flemish government contracts and public procurement, creating competitive advantages for firms with compliant capabilities.

**Compliance costs include data format conversion, staff training, quality assurance measures, and software integration investments**. International firms must adapt data collection and reporting systems to DOV-GEF specifications, potentially requiring partnerships with Belgian-accredited drilling companies to meet regulatory requirements.

The **Belgian geotechnical market forms part of the European geotechnical instrumentation and monitoring market, expected to grow at 13.8% CAGR (2022-2029)**. Strong infrastructure investment climate and government support for digital transformation create opportunities for firms with DOV-GEF expertise, while early adoption provides competitive advantages in this evolving market landscape.

Differences from Dutch practices include decentralized regional management versus Netherlands' centralized approach, distinct format specifications with Belgian-specific tags, and separate regulatory frameworks despite ongoing cross-border collaboration through H3O geological modeling projects.

## Conclusion

DOV-GEF represents a sophisticated regional adaptation of international geotechnical standards, demonstrating how standardization efforts can address specific national requirements while maintaining global compatibility. The format's success stems from strong regulatory support and mandatory usage requirements, creating a unique market dynamic where compliance drives adoption rather than competitive advantage.

For international firms, DOV-GEF compliance represents both a market access requirement and a competitive differentiator in Belgium's growing geotechnical sector. The format's technical sophistication, regulatory backing, and integration with broader Belgian digital infrastructure initiatives position it as a long-term standard for Belgian geotechnical data management.

The ongoing evolution of DOV-GEF, including recent organizational expansions and enhanced data quality requirements, suggests continued development and refinement. As Belgium advances its digital transformation initiatives and EU interoperability requirements, DOV-GEF will likely serve as a model for regional geological data standardization while maintaining its distinctive Belgian characteristics and technical requirements.