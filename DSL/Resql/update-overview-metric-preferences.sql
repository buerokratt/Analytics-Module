UPDATE user_overview_metric_preference
SET "ordinality" = :ordinality, active = :active
WHERE user_id_code = :user_id_code
    AND metric = :metric :: overview_metric;
