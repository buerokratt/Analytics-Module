/*
declaration:
  version: 0.1
  description: "Create a new scheduled report and return its metadata"
  method: post
  namespace: service_management
  returns: json
  allowlist:
    query:
      - field: name
        type: string
        description: "Name of the scheduled report"
      - field: period
        type: string
        description: "Reporting period (e.g., daily, weekly)"
      - field: metrics
        type: string
        description: "Comma-separated list of metrics for the report"
      - field: dataset_id
        type: string
        description: "Dataset identifier associated with the report"
      - field: start_date
        type: date
        description: "Start date for the reporting period"
      - field: end_date
        type: date
        description: "End date for the reporting period"
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
        description: "Report period"
      - field: metrics
        type: string[]
        description: "List of metrics used in the report"
      - field: created
        type: timestamp
        description: "Creation timestamp"
      - field: updated
        type: timestamp
        description: "Last update timestamp"
      - field: start_date
        type: date
        description: "Start date of the report period"
      - field: end_date
        type: date
        description: "End date of the report period"
      - field: deleted
        type: boolean
        description: "Indicates whether the report is marked as deleted"
*/
INSERT INTO scheduled_reports (
    name, period, metrics, dataset_id, start_date, end_date
)
VALUES (:name, :period, ARRAY[:metrics], :dataset_id, :start_date, :end_date)
RETURNING
    id, name, dataset_id, period, metrics, created, updated, start_date, end_date, deleted;
