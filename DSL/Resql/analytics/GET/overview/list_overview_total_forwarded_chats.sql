/*
declaration:
  version: 0.1
  description: "Retrieve counts of redirected chats and chats with non-empty external IDs for the previous day"
  method: get
  namespace: overview
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: metric_value
        type: number
        description: "Metric value representing either redirected chats or chats with external ID (two values returned via UNION ALL)"
*/
WITH
    forwarded_chats_by_csa AS (
        SELECT
            base_id,
            customer_support_id,
            customer_support_display_name,
            ended
        FROM chat.chat
        WHERE
            status = 'REDIRECTED'
            AND customer_support_id <> '' AND customer_support_id IS NOT NULL
        GROUP BY base_id, customer_support_id, customer_support_display_name, ended
    )

SELECT COUNT(DISTINCT base_id) AS metric_value
FROM forwarded_chats_by_csa
WHERE
    DATE_TRUNC('day', forwarded_chats_by_csa.ended)
    = DATE_TRUNC('day', CURRENT_DATE - '1 day'::INTERVAL)
UNION ALL
SELECT
    COUNT(DISTINCT base_id) FILTER (
        WHERE external_id IS NOT NULL AND external_id <> ''
    ) AS metric_value
FROM chat.chat
WHERE
    DATE_TRUNC('day', chat.ended) = DATE_TRUNC('day', CURRENT_DATE - '1 day'::INTERVAL)
