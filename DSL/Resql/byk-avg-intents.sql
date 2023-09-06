WITH chat_intent_counts AS (
    SELECT 
        COUNT(intent) AS intent_count,
        MIN(created) AS created
    FROM message m
    WHERE created::date BETWEEN :start::date AND :end::date
    AND intent IS NOT NULL
    GROUP BY chat_base_id
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    COALESCE(AVG(intent_count), 0) AS avg_num_of_intent
FROM chat_intent_counts
GROUP BY time
ORDER BY time
