Instance: RS-LegioLabStudyTemplate
InstanceOf: ResearchStudy
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/ResearchStudy/RS-LegioLabStudy"
* name = "LegioLabStudyTemplate"
* title = "Legio Laboratory Study"
* status = #active
* phase = https://www.isis.com/CodeSystem/COS-ResearchStudyPhase#template "Template"
* description = "Template study used to validate the Legio workflow with two patients, an HbA1c laboratory observation and three research variables: gender, birth date and HbA1c."
* period.start = "2026-09-01"
* recruitment.eligibility = Reference(EvidenceVariable/EV-LegioLabInclusion)
* recruitment.eligibility.identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* recruitment.eligibility.identifier.value = "LegioLabInclusion"
* extension[+].url = "https://www.isis.com/StructureDefinition/EXT-Datamart"
* extension[=].extension[+].url = "variable"
* extension[=].extension[=].valueReference = Reference(EvidenceVariable/EV-LegioLabVariablesGroup)
* extension[=].extension[=].valueReference.identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* extension[=].extension[=].valueReference.identifier.value = "LegioLabVariablesGroup"
