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
      - field: working_time_start
        type: integer
        description: "Default working hours start (0-23)"
      - field: working_time_end
        type: integer
        description: "Default working hours end (0-23)"
      - field: sunday_working_time_start
        type: integer
        description: "Sunday working hours start"
      - field: sunday_working_time_end
        type: integer
        description: "Sunday working hours end"
      - field: monday_working_time_start
        type: integer
        description: "Monday working hours start"
      - field: monday_working_time_end
        type: integer
        description: "Monday working hours end"
      - field: tuesday_working_time_start
        type: integer
        description: "Tuesday working hours start"
      - field: tuesday_working_time_end
        type: integer
        description: "Tuesday working hours end"
      - field: wednesday_working_time_start
        type: integer
        description: "Wednesday working hours start"
      - field: wednesday_working_time_end
        type: integer
        description: "Wednesday working hours end"
      - field: thursday_working_time_start
        type: integer
        description: "Thursday working hours start"
      - field: thursday_working_time_end
        type: integer
        description: "Thursday working hours end"
      - field: friday_working_time_start
        type: integer
        description: "Friday working hours start"
      - field: friday_working_time_end
        type: integer
        description: "Friday working hours end"
      - field: saturday_working_time_start
        type: integer
        description: "Saturday working hours start"
      - field: saturday_working_time_end
        type: integer
        description: "Saturday working hours end"
*/
SELECT 
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationWorkingTimeStartISO'
    ) AS working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationWorkingTimeEndISO'
    ) AS working_time_end,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSundayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationSundayWorkingTimeStartISO'
    ) AS sunday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSundayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationSundayWorkingTimeEndISO'
    ) AS sunday_working_time_end,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationMondayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationMondayWorkingTimeStartISO'
    ) AS monday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationMondayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationMondayWorkingTimeEndISO'
    ) AS monday_working_time_end,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationTuesdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationTuesdayWorkingTimeStartISO'
    ) AS tuesday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationTuesdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationTuesdayWorkingTimeEndISO'
    ) AS tuesday_working_time_end,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWednesdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationWednesdayWorkingTimeStartISO'
    ) AS wednesday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationWednesdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationWednesdayWorkingTimeEndISO'
    ) AS wednesday_working_time_end,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationThursdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationThursdayWorkingTimeStartISO'
    ) AS thursday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationThursdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationThursdayWorkingTimeEndISO'
    ) AS thursday_working_time_end,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationFridayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationFridayWorkingTimeStartISO'
    ) AS friday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationFridayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationFridayWorkingTimeEndISO'
    ) AS friday_working_time_end,

    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSaturdayWorkingTimeStartISO' AND deleted IS false)
     AND key = 'organizationSaturdayWorkingTimeStartISO'
    ) AS saturday_working_time_start,
    
    (SELECT EXTRACT(HOUR FROM value::timestamp) 
     FROM config.configuration 
     WHERE created = (SELECT MAX(created) FROM config.configuration WHERE key = 'organizationSaturdayWorkingTimeEndISO' AND deleted IS false)
     AND key = 'organizationSaturdayWorkingTimeEndISO'
    ) AS saturday_working_time_end