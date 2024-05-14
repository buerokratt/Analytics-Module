INSERT INTO configuration (key, value, deleted)
SELECT
  key,
  NULL AS value,
  TRUE AS deleted
FROM configuration
WHERE key LIKE 'odp_%'
