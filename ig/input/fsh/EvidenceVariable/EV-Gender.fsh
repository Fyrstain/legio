Instance: EV-Gender
InstanceOf: EvidenceVariable
Description: "Gender research variable for the Legio laboratory study."
Usage: #definition

* url = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-Gender"

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable"
  * value = "Gender"

* name = "Gender"
* title = "Patient Gender"
* status = #draft
* description = "Gender of the patient."
* type = #continuous

* extension[+]
  * url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
  * valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"

* characteristic[+]
  * description = "Patient gender."
  * definitionExpression
    * description = "Returns the gender of the patient."
    * name = "gender"
    * language = #text/cql-identifier
    * expression = "gender"
    * reference = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"