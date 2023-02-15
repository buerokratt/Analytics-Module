WITH waiting_times AS (
    SELECT 
        DATE_TRUNC(:period, m1.created) AS time,
        m1.chat_base_id,
        (m2.created - m1.created) AS waiting_time
    FROM message m1
    JOIN message m2
    ON m1.chat_base_id = m2.chat_base_id
    WHERE m1.author_role = 'end-user'
    AND m2.author_role = 'chatbot'
    AND m2.created > m1.created
    AND m1.created BETWEEN :start::date AND :end::date
)
SELECT 
    time, 
    EXTRACT(epoch FROM (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY waiting_time)))::integer AS median_waiting_time
FROM waiting_times
GROUP BY time
ORDER BY time
