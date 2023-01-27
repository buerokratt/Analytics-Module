import React, { useRef } from 'react'
import { OverviewMetricPreference } from '../../../types/overview-metrics'
import { useDrag, useDrop, XYCoord } from 'react-dnd'

type Props = {
  metric: OverviewMetricPreference
  toggleMetricActive: (metric: OverviewMetricPreference) => void
  moveMetric: (metricName: string, target: number) => void
  saveReorderedMetric: (metric: OverviewMetricPreference, newIndex: number) => void
  index: number
}

const DraggableListItem = ({ metric, toggleMetricActive, moveMetric, saveReorderedMetric, index }: Props) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'OverviewList',
    item: { metric, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'OverviewList',
    hover: (item: { index: number; metric: OverviewMetricPreference }, monitor) => {
      if (item.index === index) return
      if (!ref.current) return

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      if (item.index < index && hoverClientY < hoverMiddleY) return
      if (item.index > index && hoverClientY > hoverMiddleY) return

      moveMetric(item.metric.metric, index)

      item.index = index
    },
    drop: (item: { index: number; metric: OverviewMetricPreference }, monitor) => {
      saveReorderedMetric(item.metric, item.index)
    },
  })

  drag(drop(ref))
  return (
    <div ref={ref} style={{ padding: '10px', border: '1px solid black', margin: '4px', opacity: isDragging ? 0 : 1 }}>
      <input type="checkbox" checked={metric.active} onChange={() => toggleMetricActive(metric)}></input>{' '}
      {metric.metric}
    </div>
  )
}

export default DraggableListItem
