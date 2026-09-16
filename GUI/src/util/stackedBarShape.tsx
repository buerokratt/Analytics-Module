import React from 'react';

const STACK_GAP = 2;
const CORNER_RADIUS = 4;

type BarShapeProps = {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly fill?: string;
  readonly payload?: Record<string, number | string>;
};

export const createStackedBarShape = (keys: string[], key: string) => (props: BarShapeProps) => {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props;

  if (!height || height <= 0 || !payload) return null;

  const index = keys.indexOf(key);
  const hasSegmentAbove = keys.slice(index + 1).some((k) => Number(payload[k]) > 0);
  const hasSegmentBelow = keys.slice(0, index).some((k) => Number(payload[k]) > 0);

  const gapAbove = hasSegmentAbove ? STACK_GAP / 2 : 0;
  const gapBelow = hasSegmentBelow ? STACK_GAP / 2 : 0;
  const adjustedHeight = height - gapAbove - gapBelow;

  if (adjustedHeight <= 0) return null;

  const adjustedY = y + gapAbove;
  const radius = Math.min(CORNER_RADIUS, width / 2, adjustedHeight / 2);

  return <rect x={x} y={adjustedY} width={width} height={adjustedHeight} fill={fill} rx={radius} ry={radius} />;
};
