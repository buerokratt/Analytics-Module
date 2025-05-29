/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration entry by key"
  method: get
  namespace: service_management
  returns: json
  allowlist:
    query:
      - field: key
        type: string
        description: "Configuration key to filter by"
  response:
    fields:
      - field: id
        type: integer
        description: "Primary key of the configuration entry"
      - field: key
        type: string
        description: "Configuration key"
      - field: value
        type: string
        description: "Configuration value"
*/
SELECT
    id,
    key,
    value
FROM configuration
WHERE
    key = :key
    AND created IN (
        SELECT MAX(created) FROM configuration
        GROUP BY key
    )
    AND NOT deleted;
