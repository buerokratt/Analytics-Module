-- liquibase formatted sql
-- changeset gertdrui:1674138934 splitStatements:false
CREATE OR REPLACE FUNCTION reorder_metric_preferences() RETURNS TRIGGER AS 
$$
BEGIN 

IF new."ordinality" < old."ordinality" THEN
    UPDATE user_overview_metric_preference
    SET "ordinality" = "ordinality" + 1
    WHERE "ordinality" >= new."ordinality"
        AND "ordinality" < old.ordinality
        AND metric <> old.metric
        AND user_id_code = old.user_id_code;
ELSE
    UPDATE user_overview_metric_preference
    SET "ordinality" = "ordinality" - 1
    WHERE "ordinality" > old."ordinality"
        AND "ordinality" <= new."ordinality"
        AND metric <> old.metric
        AND user_id_code = old.user_id_code;
END IF;

RETURN new;

END;
$$ language plpgsql;

CREATE TRIGGER reorder_metric_preferences_on_update
AFTER UPDATE ON user_overview_metric_preference 
FOR EACH ROW EXECUTE PROCEDURE reorder_metric_preferences();
