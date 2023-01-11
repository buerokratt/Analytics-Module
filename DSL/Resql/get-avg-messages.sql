WITH chats AS
(
	SELECT  base_id
	FROM chat
	WHERE created BETWEEN :start::timestamptz AND :end::timestamptz
	GROUP BY  base_id
)

SELECT AVG(num_messages)
FROM
(
	SELECT  COUNT(DISTINCT base_id) AS num_messages
	FROM "message"
	WHERE chat_base_id IN ( SELECT base_id FROM chats)
	GROUP BY  chat_base_id
) AS msg_counts;