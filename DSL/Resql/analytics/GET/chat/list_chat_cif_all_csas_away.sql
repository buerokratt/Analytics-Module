/*
declaration:
  version: 0.1
  description: "Count chats over time where contact info was requested by the virtual assistant and successfully provided"
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
        description: "Time granularity for grouping chat counts"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: chat_count
        type: integer
        description: "Number of chats where contact info was requested and provided"
*/
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
WHERE created >= :start::date AND created < (:end::date + INTERVAL '1 day')
AND chat_base_id IN (SELECT chat_base_id FROM contact_info_chats)
AND chat_base_id IN (SELECT chat_base_id FROM asked_contacts_chats)
GROUP BY time
ORDER BY time;