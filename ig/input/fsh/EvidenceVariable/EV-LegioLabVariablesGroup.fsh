Instance: EV-LegioLabVariablesGroup
InstanceOf: EvidenceVariable
Description: "Group of research variables for the Legio laboratory study."
Usage: #definition

* url = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-LegioLabVariablesGroup"

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable"
  * value = "LegioLabVariablesGroup"

* name = "LegioLabVariablesGroup"
* title = "Legio Laboratory Research Variables"
* status = #active
* description = "Group of research variables for the Legio laboratory study."
* type = #descriptive

* extension[+]
  * url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
  * valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"

// R4-compatible representation of the research variable dataset.
// The deployable definitionByCombination resource is available in
// examples/legio-lab-study/EvidenceVariable-EV-LegioLabVariablesGroup.json.

* relatedArtifact[+]
  * type = #composed-of
  * display = "Patient Gender"
  * resource = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-Gender"

* relatedArtifact[+]
  * type = #composed-of
  * display = "Patient Birth Date"
  * resource = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-BirthDate"

* relatedArtifact[+]
  * type = #composed-of
  * display = "Patient HbA1c"
  * resource = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-HbA1c"

* characteristic[+]
  * description = "Dataset composed of Gender, BirthDate and HbA1c research variables."
  * definitionCodeableConcept
    * text = "Dataset of Legio laboratory research variables"
