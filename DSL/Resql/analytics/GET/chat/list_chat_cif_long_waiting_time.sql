/*
declaration:
  version: 0.1
  description: "Count chats where end-users waited longer than a threshold before receiving a response, in cases where contact information was available and a backoffice-user was involved"
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
      - field: threshold_seconds
        type: integer
        description: "Threshold in seconds to define a long waiting time"
  response:
    fields:
      - field: time
        type: timestamp
        description: "Start of the grouped time period"
      - field: long_waiting_time
        type: integer
        description: "Number of chats where end-user waiting time exceeded the specified threshold"
*/
WITH
    user_messages AS (
        SELECT DISTINCT ON (chat_base_id, message_created)
            chat_base_id,
            message_created AS created,
            LAG(message_created)
                OVER (
                    PARTITION BY chat_base_id
                    ORDER BY message_created
                )
            AS prev_message_time
        FROM chat.denormalized_chat_messages_for_metrics AS dcm_1
        WHERE
            message_author_role = 'end-user'
            AND message_created >= :start::DATE AND message_created < (:end::DATE + INTERVAL '1 day')
            AND EXISTS (
                SELECT 1
                FROM chat.denormalized_chat_messages_for_metrics AS dcm_2
                WHERE
                    dcm_1.chat_base_id = dcm_2.chat_base_id
                    AND dcm_2.message_author_role = 'backoffice-user'
            )
            AND EXISTS (
                SELECT 1
                FROM chat.denormalized_chat_messages_for_metrics AS dcm_3
                WHERE
                    dcm_1.chat_base_id = dcm_3.chat_base_id
                    AND (
                        dcm_3.message_event IN (
                            'contact-information-fulfilled',
                            'unavailable-contact-information-fulfilled'
                        )
                        OR (dcm_3.end_user_email IS NOT NULL AND dcm_3.end_user_email <> '')
                        OR (dcm_3.end_user_phone IS NOT NULL AND dcm_3.end_user_phone <> '')
                    )
            )
        ORDER BY chat_base_id, message_created
    ),

    waiting_times AS (
        SELECT
            chat_base_id,
            EXTRACT(
                EPOCH FROM MAX(created - prev_message_time)
            )::INT AS waiting_time_seconds,
            MIN(created) AS created
        FROM user_messages
        WHERE prev_message_time IS NOT NULL
        GROUP BY chat_base_id
    )

SELECT
    DATE_TRUNC(:period, created) AS time,
    COUNT(*) AS long_waiting_time
FROM waiting_times
WHERE waiting_time_seconds > :threshold_seconds::INTEGER
GROUP BY time
ORDER BY time;
