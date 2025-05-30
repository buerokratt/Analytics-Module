/*
declaration:
  version: 0.1
  description: "Count chats that ended with specific message events, grouped by time period and event type"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for filtering ended chats"
      - field: end
        type: date
        description: "End date for filtering ended chats"
      - field: metric
        type: string
        enum: ['microseconds', 'milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', 'decade', 'century', 'millennium']
        description: "Time granularity for grouping chat counts"
      - field: events
        type: array
        items:
          type: string
          enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Comma-separated list of event types to include in filtering (as an array of event_type)"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Start of the grouped time period"
      - field: event
        type: string
        description: "Type of message event associated with the chat"
      - field: chat_count
        type: integer
        description: "Number of distinct chats that included the event and were marked as ENDED"
*/
WITH
    ended_chats AS (
        SELECT DISTINCT ON (chat_base_id)
            chat_base_id,
            ended AS max_ended_date
        FROM chat.denormalized_chat_messages_for_metrics
        WHERE chat_status = 'ENDED'
          AND ended >= :start::DATE 
          AND ended < (:end::DATE + INTERVAL '1 day')
        ORDER BY chat_base_id ASC, timestamp DESC
    )

SELECT
    DATE_TRUNC(:metric, ec.max_ended_date) AS date_time,
    dcm.message_event AS event,
    COUNT(DISTINCT dcm.chat_base_id) AS chat_count
FROM chat.denormalized_chat_messages_for_metrics AS dcm
    INNER JOIN ended_chats AS ec ON dcm.chat_base_id = ec.chat_base_id
WHERE dcm.message_event IN (:events)
GROUP BY date_time, dcm.message_event
ORDER BY event;
