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
* text.status = #additional
* text.div = "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Patient Birth Date</b> (draft). Birth date of the patient.</p><p>Canonical URL: <code>https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-BirthDate</code></p><p>Characteristic: patient birth date. CQL expression: <code>birthDate</code>.</p></div>"
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Patient birth date."
* characteristic[=].definitionExpression.description = "Returns the birth date of the patient."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "birthDate"
