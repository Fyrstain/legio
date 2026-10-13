Extension: EXTDatamart
Id: EXT-Datamart
Title: "EXT-Datamart"
Description: "Research variables evaluated by the Legio datamart."
* ^url = "https://fyrstain.com/fhir/R4/legio/StructureDefinition/EXT-Datamart"
* extension contains
    variable 1..* and
    evaluation 0..1
* extension[variable].extension 0..0
* extension[variable].url = "variable" (exactly)
* extension[variable].value[x] only Reference(EvidenceVariable)
* extension[evaluation].extension 0..0
* extension[evaluation].url = "evaluation" (exactly)
* extension[evaluation].value[x] only Reference(List)
* url = "https://fyrstain.com/fhir/R4/legio/StructureDefinition/EXT-Datamart" (exactly)
* value[x] 0..0
