SELECT 
    MAX(
        CASE
            WHEN "key" = 'odp_key' THEN "value"
        END
    ) AS odp_key,
    MAX(
        CASE
            WHEN "key" = 'odp_org_id' THEN "value"
        END
    ) AS odp_org_id
FROM "configuration"
WHERE "key" = 'odp_key'
    OR "key" = 'odp_org_id'
