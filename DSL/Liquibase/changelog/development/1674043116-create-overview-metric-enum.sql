-- liquibase formatted sql
-- changeset gertdrui:1674043116
CREATE TYPE overview_metric AS ENUM (
    'avg_chats_by_month',
    'avg_chats_by_week',
    'avg_chats_no_csa_by_month',
    'avg_chats_no_csa_by_week',
    'total_chats_no_csa_day',
    'total_chats_month',
    'total_chats_day',
    'total_forwarded_chats_yesterday',
    'avg_waiting_time_day',
    'avg_waiting_time_week'
);
