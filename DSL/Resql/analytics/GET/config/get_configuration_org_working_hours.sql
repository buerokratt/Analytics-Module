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
