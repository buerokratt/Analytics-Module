select
    count(id)
from
    chat
where
    created between :start :: timestamp
    and :end :: timestamp;