Instance: EV-HbA1c
InstanceOf: EvidenceVariable
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-HbA1c"
* identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* identifier.value = "HbA1c"
* name = "HbA1c"
* title = "Patient HbA1c"
* status = #draft
* description = "HbA1c laboratory result of the patient."
* text.status = #additional
* text.div = "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Patient HbA1c</b> (draft). HbA1c laboratory result of the patient.</p><p>Canonical URL: <code>https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-HbA1c</code></p><p>Characteristic: final patient HbA1c result. CQL expression: <code>hba1c</code>.</p></div>"
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Patient HbA1c laboratory result."
* characteristic[=].definitionExpression.description = "Returns the final HbA1c result of the patient."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "hba1c"
