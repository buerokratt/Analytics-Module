SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT chat_base_id) AS chat_count
FROM denormalized_chat_messages_for_metrics dcm
WHERE created::date BETWEEN :start::date AND :end::date
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
    AND dcm_inner.message_author_id = 'chatbot'
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