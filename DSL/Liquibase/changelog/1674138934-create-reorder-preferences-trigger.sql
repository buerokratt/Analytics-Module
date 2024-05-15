-- liquibase formatted sql
-- changeset gertdrui:1674138934 splitStatements:false
CREATE OR REPLACE FUNCTION reorder_metric_preferences() RETURNS TRIGGER AS 
$$
DECLARE
    ORDINALITY VARCHAR2(150) := 'ordinality';
BEGIN 

IF new.ORDINALITY < old.ORDINALITY THEN
  INSERT INTO user_overview_metric_preference (metric, user_id_code, active, ordinality)
  SELECT
      metric,
      user_id_code,
      active,
      CASE 
          WHEN ordinality >= new.ordinality THEN ordinality + 1 
          ELSE ordinality 
      END
  FROM user_overview_metric_preference
  WHERE ordinality >= new.ordinality
      AND ordinality < old.ordinality
      AND metric <> old.metric
      AND user_id_code = old.user_id_code;

  -- INSERT INTO user_overview_metric_preference (user_id_code, metric, ordinality, active)
  -- SELECT
  --   old.user_id_code,
  --   old.metric,
  --   ordinality + 1,
  --   old.active
  -- FROM user_overview_metric_preference
  -- WHERE id IN (
  --   SELECT MAX(id) AS maxId
  --   FROM user_overview_metric_preference
  --   WHERE user_id_code = old.user_id_code
  --   AND ordinality >= new.ordinality
  --   AND ordinality < old.ordinality
  --   AND metric <> old.metric
  --   GROUP BY metric
  -- )

ELSE
  INSERT INTO user_overview_metric_preference (metric, user_id_code, active, ordinality)
  SELECT
      metric,
      user_id_code,
      active,
      CASE 
          WHEN ordinality >= new.ordinality THEN ordinality - 1 
          ELSE ordinality 
      END
  FROM user_overview_metric_preference
  WHERE ordinality >= new.ordinality
      AND ordinality < old.ordinality
      AND metric <> old.metric
      AND user_id_code = old.user_id_code;
END IF;

RETURN new;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reorder_metric_preferences_on_update
AFTER INSERT ON user_overview_metric_preference 
FOR EACH ROW EXECUTE PROCEDURE reorder_metric_preferences();
