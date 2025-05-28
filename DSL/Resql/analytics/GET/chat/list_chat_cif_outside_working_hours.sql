/*
declaration:
  version: 0.1
  description: "Count chats with contact information provided outside defined working hours, where the chatbot asked for contacts on behalf of an unavailable organization"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering chat messages"
      - field: end
        type: date
        description: "End date for filtering chat messages"
      - field: period
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping results"
      - field: workingTimeStart
        type: integer
        description: "Default working hours start (0–23)"
      - field: workingTimeEnd
        type: integer
        description: "Default working hours end (0–23)"
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
  response:
    fields:
      - field: time
        type: timestamp
        description: "Truncated timestamp for the grouped period"
      - field: chat_count
        type: integer
        description: "Number of qualifying chats outside working hours for the period"
*/
SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT chat_base_id) AS chat_count
FROM denormalized_chat_messages_for_metrics dcm
WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
AND (
    message_event = 'contact-information-fulfilled' 
    AND ((end_user_email IS NOT NULL AND end_user_email <> '') 
    OR (end_user_phone IS NOT NULL AND end_user_phone <> ''))
)
AND EXISTS (
    SELECT 1
    FROM denormalized_chat_messages_for_metrics dcm_inner
    WHERE dcm.chat_base_id = dcm_inner.chat_base_id
    AND dcm_inner.message_event = 'unavailable_organization_ask_contacts' 
    AND dcm_inner.message_author_id = 'buerokratt'
)
AND (
    EXTRACT(HOUR FROM timestamp) < :workingTimeStart
    OR EXTRACT(HOUR FROM timestamp) > :workingTimeEnd
    OR (EXTRACT(DOW FROM timestamp) = 0 AND (EXTRACT(HOUR FROM timestamp) < :sundayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :sundayWorkingTimeEnd))
    OR (EXTRACT(DOW FROM timestamp) = 1 AND (EXTRACT(HOUR FROM timestamp) < :mondayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :mondayWorkingTimeEnd))
    OR (EXTRACT(DOW FROM timestamp) = 2 AND (EXTRACT(HOUR FROM timestamp) < :tuesdayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :tuesdayWorkingTimeEnd))
    OR (EXTRACT(DOW FROM timestamp) = 3 AND (EXTRACT(HOUR FROM timestamp) < :wednesdayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :wednesdayWorkingTimeEnd))
    OR (EXTRACT(DOW FROM timestamp) = 4 AND (EXTRACT(HOUR FROM timestamp) < :thursdayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :thursdayWorkingTimeEnd))
    OR (EXTRACT(DOW FROM timestamp) = 5 AND (EXTRACT(HOUR FROM timestamp) < :fridayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :fridayWorkingTimeEnd))
    OR (EXTRACT(DOW FROM timestamp) = 6 AND (EXTRACT(HOUR FROM timestamp) < :saturdayWorkingTimeStart OR EXTRACT(HOUR FROM timestamp) > :saturdayWorkingTimeEnd))
)
GROUP BY time
ORDER BY time;