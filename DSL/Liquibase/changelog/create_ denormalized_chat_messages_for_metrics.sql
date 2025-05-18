-- Create the denormalized table for chat metrics
CREATE TABLE denormalized_chat_messages_for_metrics (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    chat_id BIGINT,
    chat_base_id VARCHAR(36),
    message_base_id VARCHAR(36),
    message_id BIGINT,
    chat_status VARCHAR(128),
    end_user_email VARCHAR,
    end_user_phone VARCHAR,
    feedback_rating INTEGER,
    feedback_text VARCHAR,
    customer_support_display_name VARCHAR(60),
    customer_support_id VARCHAR(555),
    customer_support_first_name VARCHAR(50),
    customer_support_last_name VARCHAR(50),
    created TIMESTAMP WITH TIME ZONE,
    updated TIMESTAMP WITH TIME ZONE,
    ended TIMESTAMP WITH TIME ZONE,
    first_message_timestamp TIMESTAMP WITH TIME ZONE,
    last_message_timestamp TIMESTAMP WITH TIME ZONE,
    message_created TIMESTAMP WITH TIME ZONE,
    message_updated TIMESTAMP WITH TIME ZONE,
    message_event VARCHAR(128),
    message_author_role VARCHAR(128),
    message_author_id VARCHAR(555),
    message_author_display_name VARCHAR(50),
    message_author_user_first_name VARCHAR(50),
    message_author_user_last_name VARCHAR(50),
    message_forwarded_from_csa VARCHAR,
    message_forwarded_to_csa VARCHAR,
    external_id VARCHAR,
    received_from VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX idx_denorm_chat_base_id ON denormalized_chat_messages_for_metrics(chat_base_id);
CREATE INDEX idx_denorm_timestamp ON denormalized_chat_messages_for_metrics(timestamp);
CREATE INDEX idx_denorm_message_id ON denormalized_chat_messages_for_metrics(message_id);
CREATE INDEX idx_denorm_chat_id ON denormalized_chat_messages_for_metrics(chat_id);

-- One-time population script for the denormalized table
INSERT INTO denormalized_chat_messages_for_metrics (
    chat_id,
    chat_base_id,
    message_base_id,
    message_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_rating,
    feedback_text,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    created,
    updated,
    ended,
    first_message_timestamp,
    last_message_timestamp,
    message_event,
    message_author_role,
    message_author_id,
    message_author_display_name,
    message_author_user_first_name,
    message_author_user_last_name,
    external_id,
    received_from,
    timestamp,
    message_created,
    message_updated,
    message_forwarded_from_csa,
    message_forwarded_to_csa
)
WITH combined_records AS (
    -- Message changes (when message changes)
    SELECT
        c.id AS chat_id,
        c.base_id AS chat_base_id,
        m.base_id AS message_base_id,
        m.id AS message_id,
        c.status AS chat_status,
        c.end_user_email,
        c.end_user_phone,
        c.feedback_rating,
        c.feedback_text,
        c.customer_support_display_name,
        c.customer_support_id,
        csa.first_name AS customer_support_first_name,
        csa.last_name AS customer_support_last_name,
        c.created,
        c.updated,
        c.ended,
        (SELECT MIN(created) FROM message WHERE chat_base_id = c.base_id) AS first_message_timestamp,
        (SELECT MAX(created) FROM message WHERE chat_base_id = c.base_id) AS last_message_timestamp,
        m.event AS message_event,
        m.author_role AS message_author_role,
        m.author_id AS message_author_id,
        u.display_name AS message_author_display_name,
        u.first_name AS message_author_user_first_name,
        u.last_name AS message_author_user_last_name,
        c.external_id,
        c.received_from,
        m.updated AS timestamp,
        m.created AS message_created,
        m.updated AS message_updated,
        m.forwarded_from_csa,
        m.forwarded_to_csa
    FROM 
        message m
    LEFT JOIN LATERAL (
        SELECT *
        FROM chat c
        WHERE c.base_id = m.chat_base_id
        AND c.updated <= m.updated
        ORDER BY c.updated DESC
        LIMIT 1
    ) c ON true
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" u
        WHERE u.login = m.author_id
        AND u.created <= m.updated
        ORDER BY u.created DESC
        LIMIT 1
    ) u ON true
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" csa
        WHERE csa.login = c.customer_support_id
        AND csa.created <= m.updated
        ORDER BY csa.created DESC
        LIMIT 1
    ) csa ON true
    
    UNION ALL
    
    -- Chat changes (when chat changes but with no corresponding message at the same timestamp)
    SELECT
        c.id AS chat_id,
        c.base_id AS chat_base_id,
        m.base_id AS message_base_id,
        m.id AS message_id,
        c.status AS chat_status,
        c.end_user_email,
        c.end_user_phone,
        c.feedback_rating,
        c.feedback_text,
        c.customer_support_display_name,
        c.customer_support_id,
        csa.first_name AS customer_support_first_name,
        csa.last_name AS customer_support_last_name,
        c.created,
        c.updated,
        c.ended,
        (SELECT MIN(created) FROM message WHERE chat_base_id = c.base_id) AS first_message_timestamp,
        (SELECT MAX(created) FROM message WHERE chat_base_id = c.base_id) AS last_message_timestamp,
        m.event AS message_event,
        m.author_role AS message_author_role,
        m.author_id AS message_author_id,
        u.display_name AS message_author_display_name,
        u.first_name AS message_author_user_first_name,
        u.last_name AS message_author_user_last_name,
        c.external_id,
        c.received_from,
        c.updated AS timestamp,
        m.created AS message_created,
        m.updated AS message_updated,
        m.forwarded_from_csa,
        m.forwarded_to_csa
    FROM 
        chat c
    LEFT JOIN LATERAL (
        SELECT *
        FROM message m
        WHERE m.chat_base_id = c.base_id
        AND m.updated <= c.updated
        ORDER BY m.updated DESC
        LIMIT 1
    ) m ON true
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" u
        WHERE u.login = m.author_id
        AND u.created <= c.updated
        ORDER BY u.created DESC
        LIMIT 1
    ) u ON true
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" csa
        WHERE csa.login = c.customer_support_id
        AND csa.created <= c.updated
        ORDER BY csa.created DESC
        LIMIT 1
    ) csa ON true
    WHERE NOT EXISTS (
        SELECT 1 
        FROM message 
        WHERE chat_base_id = c.base_id
        AND created = c.updated
    )
    
    UNION ALL
    
    -- User changes (when user changes but with no corresponding message or chat at the same timestamp)
    SELECT
        c.id AS chat_id,
        c.base_id AS chat_base_id,
        m.base_id AS message_base_id,
        m.id AS message_id,
        c.status AS chat_status,
        c.end_user_email,
        c.end_user_phone,
        c.feedback_rating,
        c.feedback_text,
        c.customer_support_display_name,
        c.customer_support_id,
        CASE 
            WHEN u.login = c.customer_support_id THEN u.first_name 
            ELSE csa.first_name 
        END AS customer_support_first_name,
        CASE 
            WHEN u.login = c.customer_support_id THEN u.last_name 
            ELSE csa.last_name 
        END AS customer_support_last_name,
        c.created,
        c.updated,
        c.ended,
        (SELECT MIN(created) FROM message WHERE chat_base_id = c.base_id) AS first_message_timestamp,
        (SELECT MAX(created) FROM message WHERE chat_base_id = c.base_id) AS last_message_timestamp,
        m.event AS message_event,
        m.author_role AS message_author_role,
        m.author_id AS message_author_id,
        CASE 
            WHEN u.login = m.author_id THEN u.display_name 
            ELSE author.display_name 
        END AS message_author_display_name,
        CASE 
            WHEN u.login = m.author_id THEN u.first_name 
            ELSE author.first_name 
        END AS message_author_user_first_name,
        CASE 
            WHEN u.login = m.author_id THEN u.last_name 
            ELSE author.last_name 
        END AS message_author_user_last_name,
        c.external_id,
        c.received_from,
        u.created AS timestamp,
        m.created AS message_created,
        m.updated AS message_updated,
        m.forwarded_from_csa,
        m.forwarded_to_csa
    FROM 
        "user" u
    -- Find chats where this user is either a CSA or message author
    LEFT JOIN LATERAL (
        SELECT c.*
        FROM chat c
        WHERE (c.customer_support_id = u.login OR 
              EXISTS (SELECT 1 FROM message WHERE chat_base_id = c.base_id AND author_id = u.login))
        AND c.updated <= u.created
        ORDER BY c.updated DESC
        LIMIT 1
    ) c ON true
    -- Find messages for this chat
    LEFT JOIN LATERAL (
        SELECT *
        FROM message m
        WHERE m.chat_base_id = c.base_id
        AND m.updated <= u.created
        ORDER BY m.created DESC
        LIMIT 1
    ) m ON true
    -- Get CSA info if this user is not the CSA
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" csa
        WHERE csa.login = c.customer_support_id
        AND csa.login != u.login
        AND csa.created <= u.created
        ORDER BY csa.created DESC
        LIMIT 1
    ) csa ON c.customer_support_id != u.login
    -- Get author info if this user is not the author
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" author
        WHERE author.login = m.author_id
        AND author.login != u.login
        AND author.created <= u.created
        ORDER BY author.created DESC
        LIMIT 1
    ) author ON m.author_id != u.login
    WHERE c.id IS NOT NULL  -- Only include users that are related to chats
    AND NOT EXISTS (
        SELECT 1 
        FROM message 
        WHERE chat_base_id = c.base_id 
        AND created = u.created
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM chat 
        WHERE base_id = c.base_id 
        AND updated = u.created
    )
)
SELECT 
    chat_id,
    chat_base_id,
    message_base_id,
    message_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_rating,
    feedback_text,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    created,
    updated,
    ended,
    first_message_timestamp,
    last_message_timestamp,
    message_event,
    message_author_role,
    message_author_id,
    message_author_display_name,
    message_author_user_first_name,
    message_author_user_last_name,
    external_id,
    received_from,
    timestamp,
    message_created,
    message_updated,
    forwarded_from_csa,
    forwarded_to_csa
FROM combined_records
ORDER BY timestamp;