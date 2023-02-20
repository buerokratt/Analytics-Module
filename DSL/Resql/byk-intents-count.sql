WITH chat_intent_counts AS (
    SELECT 
        intent,
        COUNT(intent) AS intent_count,
        MIN(created) AS created
    FROM message m
    WHERE created BETWEEN :start::date AND :end::date
    AND intent IS NOT NULL
    GROUP BY intent
    ORDER BY intent_count DESC
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    intent,
    intent_count
FROM chat_intent_counts
GROUP BY time, intent, intent_count
ORDER BY time, intent_count
