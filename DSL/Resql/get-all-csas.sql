SELECT DISTINCT author_id, author_first_name, author_last_name
     FROM message
     WHERE message.author_role = 'backoffice-user' 
     AND message.author_first_name is not null
     AND coalesce(TRIM(message.author_first_name), '') != ''
     