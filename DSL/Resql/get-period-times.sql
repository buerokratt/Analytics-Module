WITH consts AS
  (SELECT 'day' AS cday,
          'week' AS cweek,
          'month' AS cmonth,
          'quarter' AS cquarter,
          'year' AS cyear,
          'never' AS cnever)
SELECT CASE
           WHEN (:period =
                   (SELECT cday
                    FROM consts)) THEN date_trunc('day', NOW() - INTERVAL '1 day')
           WHEN (:period =
                   (SELECT cweek
                    FROM consts)) THEN date_trunc('week', NOW() - INTERVAL '1 week')
           WHEN (:period =
                   (SELECT cmonth
                    FROM consts)) THEN date_trunc('month', NOW() - INTERVAL '1 month')
           WHEN (:period =
                   (SELECT cquarter
                    FROM consts)) THEN date_trunc('quarter', NOW() - INTERVAL '3 month')
           WHEN (:period =
                   (SELECT cyear
                    FROM consts)) THEN date_trunc('year', NOW() - INTERVAL '1 year')
           WHEN (:period =
                   (SELECT cnever
                    FROM consts)) THEN date_trunc('day', :start::date)
       END AS "start",
       CASE
           WHEN (:period =
                   (SELECT cday
                    FROM consts)) THEN date_trunc('day', NOW()) - INTERVAL '1 day'
           WHEN (:period =
                   (SELECT cweek
                    FROM consts)) THEN date_trunc('week', NOW()) - INTERVAL '1 day'
           WHEN (:period =
                   (SELECT cmonth
                    FROM consts)) THEN date_trunc('month', NOW()) - INTERVAL '1 day'
           WHEN (:period =
                   (SELECT cquarter
                    FROM consts)) THEN date_trunc('quarter', NOW()) - INTERVAL '1 day'
           WHEN (:period =
                   (SELECT cyear
                    FROM consts)) THEN date_trunc('year', NOW()) - INTERVAL '1 day'
           WHEN (:period =
                   (SELECT cnever
                    FROM consts)) THEN date_trunc('day', :end::date)
       END AS "end"
