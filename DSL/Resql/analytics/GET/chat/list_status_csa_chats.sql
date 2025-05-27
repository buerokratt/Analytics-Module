/*
declaration:
  version: 0.1
  description: "Count ended chats with specific backoffice-user events, grouped by time period and event type"
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
        enum: ['day', 'week', 'month']
        description: "Time granularity for grouping results"
      - field: events
        type: array
        items:
          type: string
          enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
        description: "Comma-separated list of event types (castable to event_type) to include in filtering"
  response:
    fields:
      - field: date_time
        type: timestamp
        description: "Truncated timestamp representing the grouped period"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
        description: "Event type triggered by a backoffice-user"
      - field: chat_count
        type: integer
        description: "Number of distinct ended chats with the specified event"
*/
WITH chat_end_dates AS (
    SELECT chat_base_id, MAX(ended) AS max_ended_date
    FROM denormalized_chat_messages_for_metrics
    GROUP BY chat_base_id
)
SELECT 
    DATE_TRUNC(:metric, (select max_ended_date from chat_end_dates  where chat_base_id = dcm.chat_base_id)) AS date_time,
    dcm.message_event AS event,
    COUNT(DISTINCT dcm.chat_base_id) AS chat_count
FROM denormalized_chat_messages_for_metrics dcm
WHERE dcm.message_event::event_type IN (:events)
 AND dcm.message_author_role = 'backoffice-user'
 AND EXISTS (
      SELECT 1
      FROM denormalized_chat_messages_for_metrics dcm_status
      WHERE dcm_status.chat_base_id = dcm.chat_base_id
        AND dcm_status.chat_status = 'ENDED'
        AND chat.ended::date BETWEEN :start::date AND :end::date
  )
GROUP BY date_time, dcm.message_event
ORDER BY event;