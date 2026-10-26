Instance: QuestionnaireResponse-HbA1c
InstanceOf: QuestionnaireResponse
Description: "Completed HbA1c questionnaire response for LegioPatient1 with a 6.2% result for Observation extraction."
Usage: #example
* questionnaire = "https://fyrstain.com/fhir/R4/legio/Questionnaire/Questionnaire-HbA1c"
* status = #completed
* subject = Reference(LegioPatient1)
* item[0].linkId = "observation"
* item[0].text = "HbA1c laboratory result"
* item[0].item[0].linkId = "value"
* item[0].item[0].text = "HbA1c value"
* item[0].item[0].answer[0].valueQuantity.value = 6.2
* item[0].item[0].answer[0].valueQuantity.unit = "%"
* item[0].item[0].answer[0].valueQuantity.system = "http://unitsofmeasure.org"
* item[0].item[0].answer[0].valueQuantity.code = #%
* item[0].item[1].linkId = "category"
* item[0].item[1].text = "Observation category"
* item[0].item[1].answer[0].valueCoding = http://terminology.hl7.org/CodeSystem/observation-category#laboratory "Laboratory"
* item[0].item[2].linkId = "status"
* item[0].item[2].text = "Observation status"
* item[0].item[2].answer[0].valueCoding = http://hl7.org/fhir/observation-status#final "Final"
* item[0].item[3].linkId = "code"
* item[0].item[3].text = "Laboratory code"
* item[0].item[3].answer[0].valueCoding = http://loinc.org#4548-4 "Hemoglobin A1c/Hemoglobin.total in Blood"
