import { ChartData } from 'types/chart';
import { formatTotalPeriodCount, getColor } from '../../util/charts-utils';
import Track from '../Track';
import './PieGraph.scss';
import { usePeriodStatisticsContext } from 'components/context/PeriodStatisticsContext';

type Props = {
  data: ChartData;
  percentages: any;
};

const PieCharLegends = ({ data, percentages }: Props) => {
  const { periodStatistics } = usePeriodStatisticsContext();

  return (
    <Track
      direction="vertical"
      flex={20}
      align="left"
      isFlex
      isMultiline
    >
      {percentages?.map((e: any) => {
        const color = getColor(data, e.name);

        return (
          <Track key={`track-${e.name}`}>
            <div
              className="legend_circle"
              style={{ backgroundColor: color }}
            />
            <label style={{ color, maxLines: 1 }}>
              {`${e.name}: ${e.value} %${formatTotalPeriodCount(periodStatistics, e.name)}`}
            </label>
          </Track>
        );
      })}
    </Track>
  );
};

export default PieCharLegends;
