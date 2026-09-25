Instance: EV-HbA1c
InstanceOf: EvidenceVariable
Description: "HbA1c research variable for the Legio laboratory study."
Usage: #definition

* url = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-HbA1c"

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable"
  * value = "HbA1c"

* name = "HbA1c"
* title = "Patient HbA1c"
* status = #draft
* description = "HbA1c laboratory result of the patient."
* type = #continuous

* extension[+]
  * url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
  * valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"

* characteristic[+]
  * description = "Patient HbA1c laboratory result."
  * definitionExpression
    * description = "Returns the final HbA1c result of the patient."
    * name = "hba1c"
    * language = #text/cql-identifier
    * expression = "hba1c"
    * reference = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"