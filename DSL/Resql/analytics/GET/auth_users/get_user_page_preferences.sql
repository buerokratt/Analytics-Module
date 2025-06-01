/*
declaration:
  version: 0.1
  description: "Fetch the latest page preferences for a user and specific page, including selected columns"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: user_id
        type: string
        description: "Unique identifier of the user"
      - field: page_name
        type: string
        description: "Name of the page to retrieve preferences for"
  response:
    fields:
      - field: id
        type: string
        description: "Primary key of the page preference entry"
      - field: user_id
        type: string
        description: "User's unique identifier"
      - field: page_name
        type: string
        description: "Name of the page"
      - field: page_results
        type: integer
        description: "Page result number"
      - field: created
        type: timestamp
        description: "Timestamp when the preferences were created"
      - field: selected_columns
        type: array
        items:
          type: string
        description: "List of selected columns for the page"
*/
SELECT
    id,
    user_id,
    page_name,
    page_results,
    created,
    selected_columns
FROM auth_users.user_page_preferences
WHERE
    user_id = :user_id
    AND page_name = :page_name
ORDER BY created DESC LIMIT 1;
