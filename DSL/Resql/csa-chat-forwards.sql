WITH botname AS (
    SELECT "value"
    FROM "configuration"
    WHERE "key" = 'bot_institution_id'
    LIMIT 1
), f_chats AS
  (SELECT date_trunc(:metric, created) AS date_time,
          COUNT(DISTINCT base_id) filter (
          WHERE forwarded_to IS NOT NULL
          AND received_from <> (
                SELECT "value"
                FROM botname
            )
    ) AS forwarded_chats
   FROM chat
     Where created::date BETWEEN :start::date AND :end::date
GROUP BY 1),
     r_chats AS
  (SELECT date_trunc(:metric, created) AS date_time,
          COUNT(DISTINCT base_id) filter (
          WHERE received_from IS NOT NULL
          AND received_from <> (
                SELECT "value"
                FROM botname
            )
    ) AS received_chats
   FROM chat
     Where created::date BETWEEN :start::date AND :end::date
GROUP BY date_time),
     e_chats AS
  (SELECT date_trunc(:metric, created) AS date_time,
          COUNT(DISTINCT base_id) AS forwarded_externally
   FROM chat
   WHERE external_id IS NOT NULL
     AND created::date BETWEEN :start::date AND :end::date
   GROUP BY date_time),
     chat_forwards AS
  (SELECT COALESCE (f_chats.date_time, r_chats.date_time, e_chats.date_time) AS time_date,
                   COALESCE(forwarded_chats, 0) AS forwarded_chats,
                   COALESCE(received_chats, 0) AS received_chats,
                   COALESCE(forwarded_externally, 0) AS forwarded_externally
   FROM f_chats
   FULL JOIN r_chats ON f_chats.date_time = r_chats.date_time
   FULL JOIN e_chats ON f_chats.date_time = e_chats.date_time)
SELECT DISTINCT time_date AS date_time,
                SUM(forwarded_chats) AS forwarded_chats,
                SUM(received_chats) AS received_chats,
                SUM(forwarded_externally) AS forwarded_externally
FROM chat_forwards
GROUP BY date_time
