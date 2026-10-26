Instance: EV-LegioLabVariablesGroup
InstanceOf: EvidenceVariable
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-LegioLabVariablesGroup"
* identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* identifier.value = "LegioLabVariablesGroup"
* version = "1.0.0"
* name = "LegioLabVariablesGroup"
* title = "Legio Laboratory Research Variables"
* status = #active
* description = "Group of research variables for the Legio laboratory study."
* text.status = #additional
* text.div = "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Legio Laboratory Research Variables</b> (active). Group of research variables for the Legio laboratory study.</p><p>Canonical URL: <code>https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-LegioLabVariablesGroup</code></p><p>Dataset containing patient gender, birth date, and HbA1c variables.</p></div>"
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Legio laboratory research variables"
* characteristic[=].definitionByCombination.code = #dataset
* characteristic[=].definitionByCombination.characteristic[+].definitionCanonical = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-Gender"
* characteristic[=].definitionByCombination.characteristic[+].definitionCanonical = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-BirthDate"
* characteristic[=].definitionByCombination.characteristic[+].definitionCanonical = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-HbA1c"
