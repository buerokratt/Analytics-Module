SELECT string_agg(tablename,',') as response FROM (SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog' AND 
    schemaname != 'information_schema') AS tab;
    