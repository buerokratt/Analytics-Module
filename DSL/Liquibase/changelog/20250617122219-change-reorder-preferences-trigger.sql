-- liquibase formatted sql
-- changeset ahmer-mt:20250617122219 ignore:true
CREATE OR REPLACE FUNCTION reorder_metric_preferences() RETURNS TRIGGER AS 
$$
DECLARE
    ORDINALITY VARCHAR(150) := 'ordinality';
BEGIN 

IF new.ORDINALITY < old.ORDINALITY THEN
    UPDATE auth_users.user_overview_metric_preference
    SET ORDINALITY = ORDINALITY + 1
    WHERE ORDINALITY >= new.ORDINALITY
        AND ORDINALITY < old.ORDINALITY
        AND metric <> old.metric
        AND user_id_code = old.user_id_code;
ELSE
    UPDATE auth_users.user_overview_metric_preference
    SET ORDINALITY = ORDINALITY - 1
    WHERE ORDINALITY > old.ORDINALITY
        AND ORDINALITY <= new.ORDINALITY
        AND metric <> old.metric
        AND user_id_code = old.user_id_code;
END IF;

RETURN new;

END;
$$ LANGUAGE plpgsql;