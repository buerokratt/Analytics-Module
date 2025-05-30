/*
declaration:
  version: 0.1
  description: "Fetch the latest active user records by ID code"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: id_code
        type: string
        description: "Unique identifier for the user"
      - field: created
        type: timestamp
        description: "Timestamp when the user record was created"
      - field: csa_title
        type: string
        description: "CSA title associated with the user"
      - field: first_name
        type: string
        description: "User's first name"
      - field: last_name
        type: string
        description: "User's last name"
      - field: display_name
        type: string
        description: "Display name of the user"
*/
SELECT DISTINCT ON (u.id_code)
    u.id_code,
    u.created,
    u.csa_title,
    u.first_name,
    u.last_name,
    u.display_name
FROM
    auth_users."user" AS u
WHERE
    u.status = 'active'
ORDER BY
    u.id_code ASC,
    u.created DESC;
