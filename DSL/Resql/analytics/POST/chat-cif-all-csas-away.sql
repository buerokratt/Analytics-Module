WITH contact_info_chats AS (
    SELECT DISTINCT chat_base_id
    FROM denormalized_chat_messages_for_metrics
    WHERE message_event = 'unavailable-contact-information-fulfilled'
    AND (
        (end_user_email IS NOT NULL AND end_user_email <> '')
        OR
        (end_user_phone IS NOT NULL AND end_user_phone <> '')
    )
),
asked_contacts_chats AS (
    SELECT DISTINCT chat_base_id
    FROM denormalized_chat_messages_for_metrics
    WHERE message_event = 'unavailable_csas_ask_contacts'
    AND message_author_role = 'buerokratt'
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(DISTINCT chat_base_id) AS chat_count
FROM denormalized_chat_messages_for_metrics dcm
WHERE created::date BETWEEN :start::date AND :end::date
AND chat_base_id IN (SELECT chat_base_id FROM contact_info_chats)
AND chat_base_id IN (SELECT chat_base_id FROM asked_contacts_chats)
GROUP BY time
ORDER BY time;