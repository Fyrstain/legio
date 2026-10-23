Instance: EV-BirthDate
InstanceOf: EvidenceVariable
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-BirthDate"
* identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* identifier.value = "BirthDate"
* name = "BirthDate"
* title = "Patient Birth Date"
* status = #draft
* description = "Birth date of the patient."
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Patient birth date."
* characteristic[=].definitionExpression.description = "Returns the birth date of the patient."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "birthDate"
