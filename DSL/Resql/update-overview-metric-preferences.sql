INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
VALUES (:user_id_code, :metric::overview_metric, :ordinality, :active);
