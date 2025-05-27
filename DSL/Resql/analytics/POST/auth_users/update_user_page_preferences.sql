/*
declaration:
  version: 0.1
  description: "Insert a new user page preference entry"
  method: post
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: user_id
        type: string
        description: "Unique identifier for the user"
      - field: page_name
        type: string
        description: "Name of the page"
      - field: page_results
        type: integer
        description: "Number of the page"
      - field: created
        type: timestamp
        description: "Timestamp when the entry is created"
  response:
    fields: []
*/
INSERT INTO user_page_preferences (user_id, page_name, page_results,created)
VALUES (:user_id, :page_name, :page_results,:created::timestamp with time zone);
