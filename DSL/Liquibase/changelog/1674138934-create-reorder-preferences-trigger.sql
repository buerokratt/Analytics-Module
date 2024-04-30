-- liquibase formatted sql
-- changeset gertdrui:1674138934 splitStatements:false
CREATE OR REPLACE FUNCTION reorder_metric_preferences() RETURNS TRIGGER AS 
$$
DECLARE
    ORDINALITY VARCHAR2(150) := 'ordinality';
BEGIN 

IF new.ORDINALITY < old.ORDINALITY THEN
    UPDATE user_overview_metric_preference
    SET ORDINALITY = ORDINALITY + 1
    WHERE ORDINALITY >= new.ORDINALITY
        AND ORDINALITY < old.ORDINALITY
        AND metric <> old.metric
        AND user_id_code = old.user_id_code;
ELSE
    UPDATE user_overview_metric_preference
    SET ORDINALITY = ORDINALITY - 1
    WHERE ORDINALITY > old.ORDINALITY
        AND ORDINALITY <= new.ORDINALITY
        AND metric <> old.metric
        AND user_id_code = old.user_id_code;
END IF;

RETURN new;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reorder_metric_preferences_on_update
AFTER UPDATE ON user_overview_metric_preference 
FOR EACH ROW EXECUTE PROCEDURE reorder_metric_preferences();
