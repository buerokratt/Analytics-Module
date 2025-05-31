/*
declaration:
  version: 0.1
  description: "Retrieve organization working hours configuration from the latest non-deleted configuration entries"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: workingTimeStart
        type: integer
        description: "Default working hours start (0-23)"
      - field: workingTimeEnd
        type: integer
        description: "Default working hours end (0-23)"
      - field: sundayWorkingTimeStart
        type: integer
        description: "Sunday working hours start"
      - field: sundayWorkingTimeEnd
        type: integer
        description: "Sunday working hours end"
      - field: mondayWorkingTimeStart
        type: integer
        description: "Monday working hours start"
      - field: mondayWorkingTimeEnd
        type: integer
        description: "Monday working hours end"
      - field: tuesdayWorkingTimeStart
        type: integer
        description: "Tuesday working hours start"
      - field: tuesdayWorkingTimeEnd
        type: integer
        description: "Tuesday working hours end"
      - field: wednesdayWorkingTimeStart
        type: integer
        description: "Wednesday working hours start"
      - field: wednesdayWorkingTimeEnd
        type: integer
        description: "Wednesday working hours end"
      - field: thursdayWorkingTimeStart
        type: integer
        description: "Thursday working hours start"
      - field: thursdayWorkingTimeEnd
        type: integer
        description: "Thursday working hours end"
      - field: fridayWorkingTimeStart
        type: integer
        description: "Friday working hours start"
      - field: fridayWorkingTimeEnd
        type: integer
        description: "Friday working hours end"
      - field: saturdayWorkingTimeStart
        type: integer
        description: "Saturday working hours start"
      - field: saturdayWorkingTimeEnd
        type: integer
        description: "Saturday working hours end"
*/
SELECT 
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationWorkingTimeStartISO'
    ) AS "workingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationWorkingTimeEndISO'
    ) AS "workingTimeEnd",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSundayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationSundayWorkingTimeStartISO'
    ) AS "sundayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSundayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationSundayWorkingTimeEndISO'
    ) AS "sundayWorkingTimeEnd",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationMondayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationMondayWorkingTimeStartISO'
    ) AS "mondayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationMondayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationMondayWorkingTimeEndISO'
    ) AS "mondayWorkingTimeEnd",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationTuesdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationTuesdayWorkingTimeStartISO'
    ) AS "tuesdayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationTuesdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationTuesdayWorkingTimeEndISO'
    ) AS "tuesdayWorkingTimeEnd",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWednesdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationWednesdayWorkingTimeStartISO'
    ) AS "wednesdayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWednesdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationWednesdayWorkingTimeEndISO'
    ) AS "wednesdayWorkingTimeEnd",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationThursdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationThursdayWorkingTimeStartISO'
    ) AS "thursdayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationThursdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationThursdayWorkingTimeEndISO'
    ) AS "thursdayWorkingTimeEnd",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationFridayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationFridayWorkingTimeStartISO'
    ) AS "fridayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationFridayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationFridayWorkingTimeEndISO'
    ) AS "fridayWorkingTimeEnd",

    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSaturdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationSaturdayWorkingTimeStartISO'
    ) AS "saturdayWorkingTimeStart",
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSaturdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationSaturdayWorkingTimeEndISO'
    ) AS "saturdayWorkingTimeEnd"
