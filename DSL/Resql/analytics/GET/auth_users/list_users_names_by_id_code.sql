/*
declaration:
  version: 0.1
  description: "Fetch the latest user records by a list of ID codes"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: idCodes
        type: string
        description: "Comma-separated list of user ID codes (in array format)"
  response:
    fields:
      - field: id_code
        type: string
        description: "Unique identifier for the user"
      - field: display_name
        type: string
        description: "Display name of the user"
      - field: first_name
        type: string
        description: "User's first name"
      - field: last_name
        type: string
        description: "User's last name"
*/
SELECT DISTINCT ON (id_code)
    id_code,
    display_name,
    first_name,
    last_name
FROM auth_users."user"
WHERE id_code = ANY(STRING_TO_ARRAY(:idCodes, ','))
ORDER BY id_code ASC, created DESC;
