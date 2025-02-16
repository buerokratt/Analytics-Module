INSERT INTO "configuration" ("key", "value") VALUES 
('odp_key', TRANSLATE(ENCODE((:keyId || ':' || :apiKey)::bytea, 'base64'), E'\n', '')),
('odp_org_id', :orgId);
