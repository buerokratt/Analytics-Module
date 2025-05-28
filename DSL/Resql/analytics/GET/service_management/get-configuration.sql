SELECT id, key, value
FROM configuration
WHERE key=:key
AND created IN (SELECT max(created) from configuration GROUP BY key)
AND NOT deleted;
