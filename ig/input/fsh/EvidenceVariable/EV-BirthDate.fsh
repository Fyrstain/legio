Instance: EV-BirthDate
InstanceOf: EvidenceVariable
Description: "Birth date research variable for the Legio laboratory study."
Usage: #definition

* url = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-BirthDate"

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable"
  * value = "BirthDate"

* name = "BirthDate"
* title = "Patient Birth Date"
* status = #draft
* description = "Birth date of the patient."
* type = #continuous

* extension[+]
  * url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
  * valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"

* characteristic[+]
  * description = "Patient birth date."
  * definitionExpression
    * description = "Returns the birth date of the patient."
    * name = "birthDate"
    * language = #text/cql-identifier
    * expression = "birthDate"
    * reference = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"