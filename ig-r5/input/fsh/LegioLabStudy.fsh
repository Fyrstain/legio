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
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Patient gender."
* characteristic[=].definitionExpression.description = "Returns the gender of the patient."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "gender"


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
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Patient HbA1c laboratory result."
* characteristic[=].definitionExpression.description = "Returns the final HbA1c result of the patient."
* characteristic[=].definitionExpression.language = #text/cql-identifier
* characteristic[=].definitionExpression.expression = "hba1c"


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
* actual = true
* extension[+].url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
* extension[=].valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"
* characteristic[+].description = "Legio laboratory research variables"
* characteristic[=].definitionByCombination.code = #dataset
* characteristic[=].definitionByCombination.characteristic[+].definitionCanonical = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-Gender"
* characteristic[=].definitionByCombination.characteristic[+].definitionCanonical = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-BirthDate"
* characteristic[=].definitionByCombination.characteristic[+].definitionCanonical = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable/EV-HbA1c"


Instance: RS-LegioLabStudyTemplate
InstanceOf: ResearchStudy
Usage: #definition
* url = "https://fyrstain.com/fhir/R5/legio/ResearchStudy/RS-LegioLabStudy"
* name = "LegioLabStudyTemplate"
* title = "Legio Laboratory Study"
* status = #active
* phase = https://www.isis.com/CodeSystem/COS-ResearchStudyPhase#template "Template"
* description = "Template study used to validate the Legio workflow with two patients, an HbA1c laboratory observation and three research variables: gender, birth date and HbA1c."
* period.start = "2026-09-01"
* recruitment.eligibility = Reference(EvidenceVariable/EV-LegioLabInclusion)
* recruitment.eligibility.identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* recruitment.eligibility.identifier.value = "LegioLabInclusion"
* extension[+].url = "https://www.isis.com/StructureDefinition/EXT-Datamart"
* extension[=].extension[+].url = "variable"
* extension[=].extension[=].valueReference = Reference(EvidenceVariable/EV-LegioLabVariablesGroup)
* extension[=].extension[=].valueReference.identifier.system = "https://fyrstain.com/fhir/R5/legio/EvidenceVariable"
* extension[=].extension[=].valueReference.identifier.value = "LegioLabVariablesGroup"
