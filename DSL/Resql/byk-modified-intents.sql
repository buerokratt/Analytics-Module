WITH modified_intent_counts AS (
    SELECT 
        m.intent AS intent,
        COUNT(intent) AS intent_count,
        MIN(m.created) AS created
    FROM message m
    JOIN intents i ON i.base_id = m.intent_base_id
    WHERE m.created::date BETWEEN :start::date AND :end::date
    AND i.modified BETWEEN :start::date AND :end::date
    AND m.intent IS NOT NULL
    GROUP BY m.intent
    ORDER BY intent_count DESC
)
SELECT
    DATE_TRUNC(:period, created) AS time,
    intent,
    intent_count
FROM modified_intent_counts
GROUP BY time, intent, intent_count
ORDER BY time, intent_count
