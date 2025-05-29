/*
declaration:
  version: 0.1
  description: "Insert a new user page preference entry"
  method: post
  namespace: auth_users
  returns: json
  accepts: json
  allowlist:
    body:
      - field: user_id
        type: string
        description: "Unique identifier for the user"
      - field: page_name
        type: string
        description: "Name of the page"
      - field: page_results
        type: integer
        description: "Number of the page"
  response:
    fields: []
*/
INSERT INTO user_page_preferences (user_id, page_name, page_results)
VALUES (:user_id, :page_name, :page_results);
