/*
declaration:
  version: 0.1
  description: "Fetch current ODP configuration values including API key and organization ID"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: odp_key
        type: string
        description: "ODP API key value"
      - field: odp_org_id
        type: string
        description: "ODP organization ID"
*/
WITH
    latest_configs AS (
        SELECT DISTINCT ON (key)
            key,
            value,
            deleted,
            created
        FROM config.configuration
        WHERE created IS NOT NULL AND (key = 'odp_key' OR key = 'odp_org_id')
        ORDER BY key ASC, created DESC
    )

SELECT
    MAX(
        CASE
            WHEN key = 'odp_key' AND (deleted IS NULL OR deleted = FALSE) THEN value
        END
    ) AS odp_key,
    MAX(
        CASE
            WHEN key = 'odp_org_id' AND (deleted IS NULL OR deleted = FALSE) THEN value
        END
    ) AS odp_org_id
FROM latest_configs;
