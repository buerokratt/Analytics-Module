WITH chats AS
(
    SELECT  DISTINCT base_id
    FROM chat
    WHERE created BETWEEN :start :: timestamptz AND :end :: timestamptz 
), chat_lengths AS
(
    SELECT  age(MAX(created),MIN(created)) AS chat_length
    FROM message
    JOIN chats
    ON message.chat_base_id = chats.base_id
    GROUP BY  message.chat_base_id
)
SELECT  AVG(chat_length)
FROM chat_lengths;