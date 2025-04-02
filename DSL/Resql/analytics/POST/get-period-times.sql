WITH consts AS (
  SELECT 'day' AS cday,
         'week' AS cweek,
         'month' AS cmonth,
         'quarter' AS cquarter,
         'year' AS cyear,
         'never' AS cnever,
         INTERVAL '1 day' AS oneDay,
         INTERVAL '1 week' AS oneWeek,
         INTERVAL '1 month' AS oneMonth,
         INTERVAL '3 month' AS threeMonth,
         INTERVAL '1 year' AS oneYear
)
SELECT
  CASE
    WHEN (:period = cday) THEN date_trunc(cday, NOW() - oneDay)
    WHEN (:period = cweek) THEN date_trunc(cweek, NOW() - oneWeek)
    WHEN (:period = cmonth) THEN date_trunc(cmonth, NOW() - oneMonth)
    WHEN (:period = cquarter) THEN date_trunc(cquarter, NOW() - threeMonth)
    WHEN (:period = cyear) THEN date_trunc(cyear, NOW() - oneYear)
    WHEN (:period = cnever) THEN date_trunc(cday, :start::date)
  END AS "start",
  CASE
    WHEN (:period = cday) THEN date_trunc(cday, NOW()) - oneDay
    WHEN (:period = cweek) THEN date_trunc(cweek, NOW()) - oneDay
    WHEN (:period = cmonth) THEN date_trunc(cmonth, NOW()) - oneDay
    WHEN (:period = cquarter) THEN date_trunc(cquarter, NOW()) - oneDay
    WHEN (:period = cyear) THEN date_trunc(cyear, NOW()) -  oneDay
    WHEN (:period = cnever) THEN date_trunc(cday, :end::date)
  END AS "end"
FROM consts;   
