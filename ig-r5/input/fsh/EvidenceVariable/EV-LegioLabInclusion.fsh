Instance: EV-LegioLabInclusion
InstanceOf: EvidenceVariable
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-LegioLabInclusion"
* identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* identifier.value = "LegioLabInclusionVariable"
* name = "LegioLabInclusionVariable"
* title = "Inclusion Variable for Legio Laboratory Study"
* status = #draft
* description = "Include patients who have a final HbA1c laboratory observation."
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabInclusionCriteria"
* characteristic[+].description = "Patient has a final HbA1c laboratory observation."
* characteristic[=].definitionExpression.description = "Evaluates whether the patient has a final HbA1c observation."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "isIncluded"
