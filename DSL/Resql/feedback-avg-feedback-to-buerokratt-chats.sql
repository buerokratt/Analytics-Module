SELECT date_trunc(:metric, created) AS date_time,
       round(100.0 * sum(case when feedback_rating is not null then 1 end) / Count(distinct base_id), 1) as average
FROM chat
WHERE EXISTS
    (SELECT 1
     FROM message
     WHERE message.chat_base_id = chat.base_id
       AND message.author_role = 'buerokratt')
AND status = 'ENDED'
AND created::date BETWEEN :start::date AND :end::date
GROUP BY 1
