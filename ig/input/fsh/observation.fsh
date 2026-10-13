Instance: LegioHbA1cPatient1
InstanceOf: Observation
Usage: #example
* status = #final
* category[0].coding.system = "http://terminology.hl7.org/CodeSystem/observation-category"
* category[0].coding.code = #laboratory
* code.coding.system = "http://loinc.org"
* code.coding.code = #4548-4
* code.coding.display = "Hemoglobin A1c/Hemoglobin.total in Blood"
* subject = Reference(LegioPatient1)
* effectiveDateTime = "2026-09-01T10:00:00+02:00"
* valueQuantity.value = 6.2
* valueQuantity.unit = "%"
* valueQuantity.system = "http://unitsofmeasure.org"
* valueQuantity.code = #%

Instance: LegioHbA1cPatient2
InstanceOf: Observation
Usage: #example
* status = #final
* category[0].coding.system = "http://terminology.hl7.org/CodeSystem/observation-category"
* category[0].coding.code = #laboratory
* code.coding.system = "http://loinc.org"
* code.coding.code = #4548-4
* code.coding.display = "Hemoglobin A1c/Hemoglobin.total in Blood"
* subject = Reference(LegioPatient2)
* effectiveDateTime = "2026-09-01T10:00:00+02:00"
* valueQuantity.value = 7.4
* valueQuantity.unit = "%"
* valueQuantity.system = "http://unitsofmeasure.org"
* valueQuantity.code = #%