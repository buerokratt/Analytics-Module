SELECT metric,
    "ordinality",
    active
FROM user_overview_metric_preference
WHERE user_id_code = :user_id_code
ORDER BY "ordinality" ASC;
