import React, { useEffect, useRef, useState } from 'react';
import { PieChart, Cell, Pie, Tooltip, Legend } from 'recharts';
import { chartDataKey, getColor } from '../../util/charts-utils';
import ChartToolTip from '../ChartToolTip';
import PercentageToolTip from '../PercentageToolTip';
import Track from '../Track';
import './PieGraph.scss';

type Props = {
  data: any;
};

const PieGraph = ({ data }: Props) => {
  const [width, setWidth] = useState<number>(10);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWidth(ref.current?.clientWidth ?? 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={ref}>
      <Track>
        <PieChart
          width={width / 2}
          height={width / 3.8}
          data={data.chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {(data?.chartData?.length > 0 ?? false) && data?.percentagesData == undefined && (
            <Pie
              data={data.chartData}
              cx="50%"
              cy="50%"
              outerRadius={170}
              fill="#8884d8"
              dataKey={chartDataKey}
            >
              {(data?.chartData?.length > 0 ?? false) &&
                Object.keys(data.chartData[0]).map((k, i) => {
                  return k === chartDataKey ? null : (
                    <Cell
                      key={k}
                      type="monotone"
                      stroke={getColor(data, k)}
                      fill={getColor(data, k)}
                    />
                  );
                })}
            </Pie>
          )}
          {data?.percentagesData != undefined && (
            <Pie
              data={data.percentagesData}
              cx="50%"
              cy="50%"
              outerRadius={170}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.percentagesData.map((e: any, i: any) => {
                return (
                  <Cell
                    key={`cell-${i}`}
                    type="monotone"
                    stroke={getColor(data, e['name'])}
                    fill={getColor(data, e['name'])}
                  />
                );
              })}
            </Pie>
          )}
          <Tooltip content={data?.percentagesData != undefined ? <PercentageToolTip /> : <ChartToolTip />} />
        </PieChart>
        <Track
          direction="vertical"
          flex={20}
          align="left"
          isFlex={true}
          isMultiline={true}
        >
          {(data?.chartData?.length > 0 ?? false) &&
            data?.percentagesData == undefined &&
            Object.keys(data.chartData[0]).map((k, i) => {
              return (
                <Track key={k}>
                  {k !== chartDataKey && (
                    <>
                      <div
                        className="legend_circle"
                        style={{ backgroundColor: getColor(data, k) }}
                        key={k}
                      />
                      <label style={{ color: getColor(data, k) }}>{k}</label>
                    </>
                  )}
                </Track>
              );
            })}
          {data?.percentagesData != undefined &&
            data.percentagesData.map((e: any, i: any) => {
              return (
                <Track key={`track-${i}`}>
                  {
                    <div
                      className="legend_circle"
                      style={{ backgroundColor: getColor(data, e['name']) }}
                      key={`circle-${i}`}
                    />
                  }
                  <label
                    style={{ color: getColor(data, e['name']), maxLines: 1 }}
                  >{`${e['name']}: ${e['value']} %`}</label>
                </Track>
              );
            })}
        </Track>
      </Track>
    </div>
  );
};

export default PieGraph;
