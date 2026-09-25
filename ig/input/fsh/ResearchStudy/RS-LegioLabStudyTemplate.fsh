Instance: RS-LegioLabStudyTemplate
InstanceOf: ResearchStudy
Description: "Template for the Legio laboratory study."
Usage: #definition

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/ResearchStudy"
  * value = "LegioLabStudyTemplate"

* title = "Legio Laboratory Study"
* status = #active

* description = """
Template study used to validate the Legio workflow with two patients,
an HbA1c laboratory observation and three research variables:
gender, birth date and HbA1c.
"""

* period
  * start = "2026-09-01"

// Legio study phase.
* phase = https://www.isis.com/CodeSystem/COS-ResearchStudyPhase#template "Template"

// R4 representation of the R5 ResearchStudy.url.
// The deployable R5-like resource is provided in examples/legio-lab-study.
* extension[+]
  * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-ResearchStudy.url"
  * valueUri = "https://fyrstain.com/fhir/R4/legio/ResearchStudy/RS-LegioLabStudy"

// R4 representation of recruitment.eligibility.
// ResearchStudy.enrollment only accepts Group in R4, therefore
// alternate-reference is used for the EvidenceVariable.
* enrollment[+]
  * display = "Legio laboratory study inclusion criteria"
  * extension[+]
    * url = "http://hl7.org/fhir/StructureDefinition/alternate-reference"
    * valueReference = Reference(EvidenceVariable/EV-LegioLabInclusion)

// Research variables are represented by the dataset EvidenceVariable.
* extension[+]
  * url = "https://www.isis.com/StructureDefinition/EXT-Datamart"
  * extension[+]
    * url = "variable"
    * valueReference = Reference(EvidenceVariable/EV-LegioLabVariablesGroup)
