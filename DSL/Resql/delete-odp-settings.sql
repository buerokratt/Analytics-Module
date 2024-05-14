INSERT INTO configuration (key, value, deleted)
SELECT
  key,
  NULL value,
  TRUE deleted
FROM configuration
WHERE key LIKE 'odp_%'
