/*
declaration:
  version: 0.1
  description: "Fetch current ODP configuration values including API key and organization ID"
  method: get
  namespace: service_management
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
SELECT
    MAX(
        CASE
            WHEN key = 'odp_key' THEN value
        END
    ) AS odp_key,
    MAX(
        CASE
            WHEN key = 'odp_org_id' THEN value
        END
    ) AS odp_org_id
FROM configuration
WHERE
    key = 'odp_key'
    OR key = 'odp_org_id'
