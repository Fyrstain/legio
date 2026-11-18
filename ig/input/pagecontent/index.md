# Legio Implementation Guide

## Context 

Legio is a FHIR R5-based web application.

## How to read this Implementation Guide (IG) 

 - **[Home](index.html)**: The home page provides the introduction and context for this implementation guide.

 - **FHIR Artifacts**: 
    - **[Artifacts](artifacts.html)**: These pages provide detailed descriptions and formal definitions for all FHIR objects defined in this guide.

## Dependencies

{% include dependency-table.xhtml %}

## Global Profiles

{% include globals-table.xhtml %}

## IP Statements

{% include ip-statements.xhtml %}

## Cross Version Analysis

{% include cross-version-analysis.xhtml %}

## Contact

  **[Fyrstain](https://fyrstain.com)** is responsible for this IG. 

   If you have any questions, please contact us: **[contact@fyrstain.com](https://fyrstain.com/contact)**

## Application behaviour and version scope

The current front-end exposes authenticated research-study navigation: the **Studies** list, study-definition and instance selection, and a study detail view. It also links to this embedded Implementation Guide. Study phase filters depend on a configurable terminology endpoint and can be unavailable when the associated ValueSet cannot be resolved. These screens are not evidence that every research resource can be edited.

Legio deliberately produces **two** guides: the `ig/` guide targets FHIR R4 (4.0.1) and the `ig-r5/` guide targets FHIR R5 (5.0.0). Do not treat an R5 resource as an R4 resource or copy definitions between the guides without version-specific validation. The R5 research model includes ResearchStudy and EvidenceVariable plus the Datamart extension. The existing R4 material includes patient, questionnaire and CQL-related examples. Consult the version-specific artifact pages for normative definitions.

### Integration prerequisites

The application uses a configurable FHIR API and terminology API, with Keycloak authentication. A server must support the specific search and read interactions exercised by each study screen; the presence of a FHIR resource in the guide alone is not a guarantee of supported writes. Test both guides, and review `ig/output/qa.html` and `ig-r5/output/qa.html` after Publisher builds.

### Current versus planned

The routes `/Studies`, `/StudiesInstances`, `/Studies/:definitionId` and `/Study/:studyId` are implemented in the router. Additional study-management functionality must be documented as planned until supported by the application and validated against a server.
