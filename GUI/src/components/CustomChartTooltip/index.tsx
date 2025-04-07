import { TooltipProps } from 'recharts';
import { formatDate, round } from '../../util/charts-utils';
import './CustomChartTooltip.scss';

const CustomChartTooltip = ({
  active,
  payload,
  label,
  formatDate,
}: TooltipProps<number, string> & { formatDate: (date: Date) => string }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const itemsPerColumn = 10;
  const columns = Math.ceil(payload.length / itemsPerColumn);

  const columnData = Array.from({ length: columns }, (_, colIndex) =>
    payload.slice(colIndex * itemsPerColumn, (colIndex + 1) * itemsPerColumn)
  );

  return (
    <div className="chart-tooltip">
      <div
        className="chart-tooltip__header"
        style={{ '--columns': columns } as React.CSSProperties}
      >
        {label && typeof label === 'number' ? formatDate(new Date(label)) : label}
      </div>
      {columnData.map((column, colIndex) => (
        <div key={colIndex}>
          {column.map((entry, index) => (
            <div key={index}>
              <span style={{ color: entry.color }}>
                {entry.name}: {typeof entry.value === 'number' ? round(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CustomChartTooltip;
