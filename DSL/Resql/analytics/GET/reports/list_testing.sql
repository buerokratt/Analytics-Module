/*
declaration:
  version: 0.1
  description: "Fetch all user-defined tables with their schema and owner information"
  method: get
  namespace: reports
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: schemaname
        type: string
        description: "Name of the schema the table belongs to"
      - field: tablename
        type: string
        description: "Name of the table"
      - field: tableowner
        type: string
        description: "Owner of the table"
*/
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_catalog.pg_tables
WHERE
    schemaname != 'pg_catalog'
    AND schemaname != 'information_schema';
