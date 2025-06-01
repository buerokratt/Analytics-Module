/*
declaration:
  version: 0.1
  description: "Calculate dynamic start and end dates based on selected reporting period or explicit dates"
  method: get
  namespace: config
  returns: json
  allowlist:
    query:
      - field: period
        type: string
        enum: ['day', 'week', 'month', 'quarter', 'year', 'never']
        description: "Period type used to calculate reporting range"
      - field: start
        type: date
        description: "Explicit start date (used only when period is 'never')"
      - field: end
        type: date
        description: "Explicit end date (used only when period is 'never')"
  response:
    fields:
      - field: start
        type: string
        description: "Calculated start date for the reporting range (YYYY-MM-DD format)"
      - field: end
        type: string
        description: "Calculated end date for the reporting range (YYYY-MM-DD format)"
*/
SELECT
    CASE
        WHEN :period = 'day' THEN TO_CHAR(DATE_TRUNC('day', NOW() - INTERVAL '1 day'), 'YYYY-MM-DD')
        WHEN :period = 'week' THEN TO_CHAR(DATE_TRUNC('week', NOW() - INTERVAL '1 week'), 'YYYY-MM-DD')
        WHEN :period = 'month' THEN TO_CHAR(DATE_TRUNC('month', NOW() - INTERVAL '1 month'), 'YYYY-MM-DD')
        WHEN :period = 'quarter' THEN TO_CHAR(DATE_TRUNC('quarter', NOW() - INTERVAL '3 months'), 'YYYY-MM-DD')
        WHEN :period = 'year' THEN TO_CHAR(DATE_TRUNC('year', NOW() - INTERVAL '1 year'), 'YYYY-MM-DD')
        WHEN :period = 'never' THEN :start
        ELSE TO_CHAR(DATE_TRUNC('day', NOW() - INTERVAL '1 day'), 'YYYY-MM-DD')
    END AS start,
    CASE
        WHEN :period = 'day' THEN TO_CHAR(DATE_TRUNC('day', NOW()), 'YYYY-MM-DD')
        WHEN :period = 'week' THEN TO_CHAR(DATE_TRUNC('week', NOW()), 'YYYY-MM-DD')
        WHEN :period = 'month' THEN TO_CHAR(DATE_TRUNC('month', NOW()), 'YYYY-MM-DD')
        WHEN :period = 'quarter' THEN TO_CHAR(DATE_TRUNC('quarter', NOW()), 'YYYY-MM-DD')
        WHEN :period = 'year' THEN TO_CHAR(DATE_TRUNC('year', NOW()), 'YYYY-MM-DD')
        WHEN :period = 'never' THEN :end
        ELSE TO_CHAR(DATE_TRUNC('day', NOW()), 'YYYY-MM-DD')
    END AS "end";