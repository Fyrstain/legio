Instance: EV-LegioLabVariablesGroup
InstanceOf: EvidenceVariable
Description: "Group of research variables for the Legio laboratory study."
Usage: #definition

* url = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-LegioLabVariablesGroup"

* identifier[+]
  * system = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable"
  * value = "LegioLabVariablesGroup"

* name = "LegioLabVariablesGroup"
* title = "Legio Laboratory Research Variables"
* status = #active
* description = "Group of research variables for the Legio laboratory study."
* type = #descriptive

* extension[+]
  * url = "http://hl7.org/fhir/StructureDefinition/cqf-library"
  * valueCanonical = "https://fyrstain.com/fhir/R4/legio/Library/LegioLabResearchVariables"

// R4 representation of the R5 definitionByCombination = dataset.
* characteristic[+]
  * description = "Legio laboratory research variables"
  * definitionCodeableConcept = http://hl7.org/fhir/characteristic-combination#dataset "Dataset"

  * extension[+]
    * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic.definitionByCombination"

    * extension[+]
      * url = "code"
      * valueCode = #dataset

    * extension[+]
      * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic"
      * extension[+]
        * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic.definitionCanonical"
        * valueCanonical = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-Gender"

    * extension[+]
      * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic"
      * extension[+]
        * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic.definitionCanonical"
        * valueCanonical = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-BirthDate"

    * extension[+]
      * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic"
      * extension[+]
        * url = "http://hl7.org/fhir/5.0/StructureDefinition/extension-EvidenceVariable.characteristic.definitionCanonical"
        * valueCanonical = "https://fyrstain.com/fhir/R4/legio/EvidenceVariable/EV-HbA1c"
