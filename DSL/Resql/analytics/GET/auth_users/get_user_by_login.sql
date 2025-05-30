/*
declaration:
  version: 0.1
  description: "Authenticate user by ID code and password, returning profile and authority information"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: userIdCode
        type: string
        description: "Unique identifier for the user"
      - field: password
        type: string
        description: "Hashed password of the user"
  response:
    fields:
      - field: login
        type: string
        description: "User login name"
      - field: first_name
        type: string
        description: "User's first name"
      - field: last_name
        type: string
        description: "User's last name"
      - field: id_code
        type: string
        description: "Unique identifier for the user"
      - field: display_name
        type: string
        description: "Display name of the user"
      - field: authorities
        type: string[]
        enum: ['ROLE_ADMINISTRATOR', 'ROLE_SERVICE_MANAGER', 'ROLE_CUSTOMER_SUPPORT_AGENT', 'ROLE_CHATBOT_TRAINER', 'ROLE_ANALYST', 'ROLE_UNAUTHENTICATED']
        description: "List of authority names associated with the user"
*/
SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    authority_name AS authorities
FROM auth_users.denormalized_user_data
WHERE
    id_code = :userIdCode
    AND password_hash = :password
    AND ARRAY_LENGTH(authority_name, 1) > 0
ORDER BY created DESC
LIMIT 1;
