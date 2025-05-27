/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted scheduled report for each dataset"
  method: get
  namespace: service_management
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the scheduled report"
      - field: name
        type: string
        description: "Name of the scheduled report"
      - field: dataset_id
        type: string
        description: "Associated dataset ID"
      - field: period
        type: string
        description: "Reporting period"
      - field: metrics
        type: string[]
        description: "List of metrics included in the report"
      - field: created
        type: timestamp
        description: "Timestamp when the report was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the report was last updated"
      - field: start_date
        type: date
        description: "Start date of the reporting range"
      - field: end_date
        type: date
        description: "End date of the reporting range"
*/
SELECT
  id,
  name,
  dataset_id,
  period,
  metrics,
  created,
  updated,
  start_date,
  end_date
FROM (
  SELECT 
    id,
    name,
    dataset_id,
    period,
    metrics,
    created,
    updated,
    start_date,
    end_date,
    ROW_NUMBER() OVER (PARTITION BY dataset_id ORDER BY id DESC) as rn
  FROM scheduled_reports
  WHERE NOT deleted
) ranked
WHERE rn = 1;