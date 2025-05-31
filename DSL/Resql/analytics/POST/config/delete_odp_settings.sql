/*
declaration:
  version: 0.1
  description: "Mark all ODP-related configuration keys as deleted"
  method: post
  namespace: config
  returns: json
  accepts: json
  allowlist:
    body: []
  response:
    fields: []
*/
INSERT INTO config.configuration (key, value, deleted)
SELECT
    key,
    NULL AS value,
    TRUE AS deleted
FROM config.configuration
WHERE key LIKE 'odp_%'
