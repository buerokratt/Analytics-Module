WITH config AS (
    SELECT 
        (
            SELECT value
            FROM configuration
            WHERE key = 'organizationWorkingTimeStartISO'
            AND deleted IS false
			ORDER BY created DESC
			LIMIT 1
        )::timestamp AS workingTimeStart,
        (
            SELECT value
            FROM configuration
            WHERE key = 'organizationWorkingTimeEndISO'
            AND deleted IS false
			ORDER BY created DESC
			LIMIT 1
        )::timestamp AS workingTimeEnd
),
first_query AS (
    SELECT
        DATE_TRUNC(:period, chat.created) AS time,
        COUNT(DISTINCT base_id) AS chat_count
    FROM chat  
    JOIN customer_support_agent_activity AS csa
    ON chat.customer_support_id = csa.id_code
    WHERE chat.created::date BETWEEN :start::date AND :end::date
    AND EXISTS (
        SELECT 1
        FROM message
        WHERE message.chat_base_id = chat.base_id
        AND message.event = 'contact-information-fulfilled'
        AND (
            EXTRACT(HOUR FROM message.created) NOT BETWEEN EXTRACT(HOUR FROM (SELECT workingTimeStart FROM config)) 
            AND EXTRACT(HOUR FROM (SELECT workingTimeEnd FROM config))
        )
    )
    GROUP BY time
),
second_query AS (
    WITH user_messages AS (
        SELECT 
            chat_base_id, 
            created, 
            LAG(created) OVER (PARTITION BY chat_base_id, author_role ORDER BY created) AS prev_message_time
        FROM message
        WHERE author_role = 'end-user' 
    ),
    waiting_times AS(
        SELECT
            m.chat_base_id AS chat_base_id,
            MIN(m.created) AS created, 
            EXTRACT(epoch FROM MAX(m.created - prev_message_time))::INT AS waiting_time_seconds
        FROM user_messages m
        JOIN message ms
        ON m.chat_base_id = ms.chat_base_id
        AND ms.author_role = 'backoffice-user'
        WHERE prev_message_time IS NOT NULL
        GROUP BY m.chat_base_id
    )
    SELECT 
        DATE_TRUNC(:period, created) AS time, 
        COUNT(*) AS long_waiting_time
    FROM waiting_times
    WHERE created::date BETWEEN :start::date AND :end::date
    AND waiting_time_seconds > :threshold_seconds
    GROUP BY time
),
third_query AS (
    WITH botname AS (
        SELECT "value" AS name
        FROM "configuration"
        WHERE "key" = 'bot_institution_id'
        LIMIT 1
    )
    SELECT
        DATE_TRUNC(:period, c.created) AS time, 
        COUNT(DISTINCT base_id) AS chat_count
    FROM chat c
    JOIN customer_support_agent_activity AS csa
    ON c.customer_support_id = csa.id_code
    WHERE c.created::date BETWEEN :start::date AND :end::date
    AND (
        (
            csa.status = 'offline' 
            AND csa.created BETWEEN c.created AND c.ended
        )
        OR (
            SELECT status
            FROM customer_support_agent_activity AS csa2
            WHERE csa2.id_code = c.customer_support_id
            AND csa2.created < c.created
            ORDER BY created DESC
            LIMIT 1
        ) = 'offline'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM chat
        WHERE base_id = c.base_id
        AND customer_support_id <> ''
        AND customer_support_id <> (SELECT name FROM botname)
    )
    GROUP BY time
)
SELECT COALESCE(f.time, s.time, t.time) AS time,
       COALESCE(f.chat_count, 0) + COALESCE(s.long_waiting_time, 0) + COALESCE(t.chat_count, 0) AS sum_count
FROM first_query f
FULL JOIN second_query s ON f.time = s.time
FULL JOIN third_query t ON f.time = t.time
ORDER BY time;
