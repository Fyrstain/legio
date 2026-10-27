Instance: EV-Gender
InstanceOf: EvidenceVariable
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-Gender"
* identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* identifier.value = "Gender"
* name = "Gender"
* title = "Patient Gender"
* status = #draft
* description = "Gender of the patient."
* text.status = #additional
* text.div = "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Patient Gender</b> (draft). Gender of the patient.</p><p>Canonical URL: <code>https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-Gender</code></p><p>Characteristic: patient gender. CQL expression: <code>gender</code>.</p></div>"
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Patient gender."
* characteristic[=].definitionExpression.description = "Returns the gender of the patient."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "gender"
