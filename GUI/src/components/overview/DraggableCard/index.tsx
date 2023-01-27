import React, { useRef, useState } from 'react'
import { OverviewMetricData, OverviewMetricPreference } from '../../../types/overview-metrics'
import Card from '../../Card'
import Icon from '../../Icon'
import { MdDragIndicator } from 'react-icons/md'
import Track from '../../Track'
import { useDrag, useDrop, XYCoord } from 'react-dnd'
import clsx from 'clsx'
import './styles.scss'

type Props = {
  metric: OverviewMetricPreference
  metricData: OverviewMetricData
  index: number
  moveMetric: (metricName: string, target: number) => void
  saveReorderedMetric: (metric: OverviewMetricPreference, newIndex: number) => void
}

const DraggableCard = ({ metricData, metric, index, moveMetric, saveReorderedMetric }: Props) => {
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

      item.metric.ordinality = metric.ordinality
      moveMetric(item.metric.metric, index)
      item.index = index
    },
    drop: (item: { index: number; metric: OverviewMetricPreference }, monitor) => {
      saveReorderedMetric(item.metric, item.metric.ordinality)
    },
  })

  drag(drop(ref))

  return (
    <div ref={ref} className={clsx(['draggable-card', isDragging && 'dragging'])}>
      <Card>
        <Track>
          <Icon icon={<MdDragIndicator />} size="medium" />
          <h4>{metricData.metric}</h4>
        </Track>
        <h3>
          {metricData.data.left.value} / {metricData.data.right.value}
        </h3>
      </Card>
    </div>
  )
}

export default DraggableCard
