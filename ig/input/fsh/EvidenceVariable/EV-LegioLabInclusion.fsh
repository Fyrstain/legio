Instance: EV-LegioLabInclusion
InstanceOf: EvidenceVariable
Description: "Inclusion criteria for the Legio laboratory study."
Usage: #definition

* url = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-LegioLabInclusion"

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable"
  * value = "LegioLabInclusionVariable"

* name = "LegioLabInclusionVariable"
* title = "Inclusion Variable for Legio Laboratory Study"
* status = #draft
* description = "Include patients who have a final HbA1c laboratory observation."
* type = #dichotomous

* extension[+]
  * url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
  * valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabInclusionCriteria"

* characteristic[+]
  * description = "Patient has a final HbA1c laboratory observation."
  * definitionExpression
    * description = "Evaluates whether the patient has a final HbA1c observation."
    * name = "isIncluded"
    * language = #text/cql-identifier
    * expression = "isIncluded"
    * reference = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabInclusionCriteria"