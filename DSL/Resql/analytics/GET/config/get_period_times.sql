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
        type: timestamp
        description: "Calculated start timestamp for the reporting range"
      - field: end
        type: timestamp
        description: "Calculated end timestamp for the reporting range"
*/
WITH
    consts AS (
        SELECT
            'day' AS cday,
            'week' AS cweek,
            'month' AS cmonth,
            'quarter' AS cquarter,
            'year' AS cyear,
            'never' AS cnever,
            INTERVAL '1 day' AS one_day,
            INTERVAL '1 week' AS one_week,
            INTERVAL '1 month' AS one_month,
            INTERVAL '3 month' AS three_month,
            INTERVAL '1 year' AS one_year
    )

SELECT
    CASE
        WHEN (:period = cday) THEN DATE_TRUNC(cday, NOW() - one_day)
        WHEN (:period = cweek) THEN DATE_TRUNC(cweek, NOW() - one_week)
        WHEN (:period = cmonth) THEN DATE_TRUNC(cmonth, NOW() - one_month)
        WHEN (:period = cquarter) THEN DATE_TRUNC(cquarter, NOW() - three_month)
        WHEN (:period = cyear) THEN DATE_TRUNC(cyear, NOW() - one_year)
        WHEN (:period = cnever) THEN date_trunc(cday, :start::DATE)
    END AS start,
    CASE
        WHEN (:period = cday) THEN DATE_TRUNC(cday, NOW()) - one_day
        WHEN (:period = cweek) THEN DATE_TRUNC(cweek, NOW()) - one_day
        WHEN (:period = cmonth) THEN DATE_TRUNC(cmonth, NOW()) - one_day
        WHEN (:period = cquarter) THEN DATE_TRUNC(cquarter, NOW()) - one_day
        WHEN (:period = cyear) THEN DATE_TRUNC(cyear, NOW()) - one_day
        WHEN (:period = cnever) THEN date_trunc(cday, :end::DATE)
    END AS "end"
FROM consts;
