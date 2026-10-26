Instance: Questionnaire-HbA1c
InstanceOf: Questionnaire
Description: "Example questionnaire defining the HbA1c answers and extraction context used to create an Observation."
Usage: #example
* meta.profile[0] = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-extr-defn"
* url = "https://fyrstain.com/fhir/R4/legio/Questionnaire/Questionnaire-HbA1c"
* name = "HbA1cQuestionnaire"
* status = #active
* subjectType[0] = #Patient
* item[0].linkId = "observation"
* item[0].text = "HbA1c laboratory result"
* item[0].type = #group
* item[0].definition = "http://hl7.org/fhir/StructureDefinition/Observation#Observation"
* item[0].item[0].linkId = "value"
* item[0].item[0].text = "HbA1c value"
* item[0].item[0].type = #quantity
* item[0].item[0].definition = "http://hl7.org/fhir/StructureDefinition/Observation#Observation.value[x]"
* item[0].item[1].linkId = "category"
* item[0].item[1].text = "Observation category"
* item[0].item[1].type = #choice
* item[0].item[1].definition = "http://hl7.org/fhir/StructureDefinition/Observation#Observation.category"
* item[0].item[2].linkId = "status"
* item[0].item[2].text = "Observation status"
* item[0].item[2].type = #choice
* item[0].item[2].definition = "http://hl7.org/fhir/StructureDefinition/Observation#Observation.status"
* item[0].item[3].linkId = "code"
* item[0].item[3].text = "Laboratory code"
* item[0].item[3].type = #choice
* item[0].item[3].definition = "http://hl7.org/fhir/StructureDefinition/Observation#Observation.code"
