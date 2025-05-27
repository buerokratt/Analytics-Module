SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    authority_name AS authorities
FROM denormalized_user_data
WHERE
    id_code = :userIdCode
    AND password_hash = :password
    AND ARRAY_LENGTH(authority_name, 1) > 0
ORDER BY created DESC
LIMIT 1;

