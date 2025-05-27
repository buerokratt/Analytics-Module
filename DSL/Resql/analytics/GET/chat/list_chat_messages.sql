/*
declaration:
  version: 0.1
  description: "Fetch the latest version of each message in a chat by chat ID, ordered by creation time"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: chatId
        type: string
        description: "Unique identifier of the chat"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the message (base ID)"
      - field: chat_id
        type: string
        description: "Chat ID the message belongs to"
      - field: content
        type: string
        description: "Text content of the message"
      - field: buttons
        type: string
        description: "Serialized buttons associated with the message"
      - field: options
        type: string
        description: "Serialized options associated with the message"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
        description: "Event type triggered by the message"
      - field: author_id
        type: string
        description: "ID of the author of the message"
      - field: author_timestamp
        type: timestamp
        description: "Timestamp of the message from the author's perspective"
      - field: author_first_name
        type: string
        description: "First name of the message author"
      - field: author_last_name
        type: string
        description: "Last name of the message author"
      - field: author_role
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the author (e.g., end-user, backoffice-user)"
      - field: forwarded_by_user
        type: string
        description: "ID of the user who forwarded the message"
      - field: forwarded_from_csa
        type: string
        description: "CSA ID the message was forwarded from"
      - field: forwarded_to_csa
        type: string
        description: "CSA ID the message was forwarded to"
      - field: rating
        type: integer
        description: "Rating associated with the message, if any"
      - field: created
        type: timestamp
        description: "Timestamp when the message was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the message was last updated"
*/
WITH filtered_messages AS (
    SELECT DISTINCT ON (m.base_id)
    *
    FROM message m
    WHERE m.chat_base_id = :chatId
    ORDER BY m.base_id, m.updated DESC
)

SELECT
    fm.base_id AS id,
    fm.chat_base_id AS chat_id,
    fm.content,
    fm.buttons,
    fm.options,
    fm.event,
    fm.author_id,
    fm.author_timestamp,
    fm.author_first_name,
    fm.author_last_name,
    fm.author_role,
    fm.forwarded_by_user,
    fm.forwarded_from_csa,
    fm.forwarded_to_csa,
    fm.rating,
    fm.created,
    fm.updated
FROM filtered_messages AS fm
ORDER BY fm.created ASC;