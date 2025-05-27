/*
declaration:
  version: 0.1
  description: "Insert ODP configuration settings including encoded API key and organization ID"
  method: post
  namespace: service_management
  returns: json
  allowlist:
    query:
      - field: keyId
        type: string
        description: "ODP key ID used for encoding the API key"
      - field: apiKey
        type: string
        description: "ODP API key"
      - field: orgId
        type: string
        description: "ODP organization ID"
  response:
    fields: []
*/
INSERT INTO "configuration" ("key", "value") VALUES
('odp_key', TRANSLATE(ENCODE((:keyId || ':' || :apiKey)::bytea, 'base64'), E'\n', '')),
('odp_org_id', :orgId);
