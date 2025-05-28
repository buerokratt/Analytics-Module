/*
declaration:
  version: 0.1
  description: "Mark the most recent scheduled report for a dataset as deleted by duplicating it with the deleted flag"
  method: post
  namespace: service_management
  returns: json
  accepts: json
  allowlist:
    body:
      - field: id
        type: string
        description: "Dataset ID for which the most recent report should be marked as deleted"
  response:
    fields: []
*/

INSERT INTO scheduled_reports (name, period, metrics, dataset_id, start_date, end_date, deleted)
SELECT
  name,
  period,
  metrics,
  dataset_id,
  start_date,
  end_date,
  TRUE
FROM scheduled_reports
WHERE dataset_id = :id
ORDER BY updated DESC
LIMIT 1;
