import clsx from 'clsx'
import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { MdDragIndicator } from 'react-icons/md'
import { OverviewMetricData, OverviewMetricPreference } from '../../../types/overview-metrics'
import Card from '../../Card'
import Icon from '../../Icon'
import Track from '../../Track'
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
  const { t } = useTranslation();

  const [{ isDragging }, drag] = useDrag({
    type: 'OverviewList',
    item: { metric, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ handlerId }, drop] = useDrop({
    accept: 'OverviewList',
    hover: (item: { index: number; metric: OverviewMetricPreference }) => {
      if (item.index === index) return
      if (!ref.current) return

      item.metric.ordinality = metric.ordinality
      moveMetric(item.metric.metric, index)
      item.index = index
    },
    drop: (item: { index: number; metric: OverviewMetricPreference }) => {
      saveReorderedMetric(item.metric, item.metric.ordinality)
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
  })

  drag(drop(ref))

  return (
    <div ref={ref} className={clsx(['draggable-card', isDragging && 'dragging'])} data-handler-id={handlerId}>
      <Card>
        <Track className='title-track'>
          <Icon icon={<MdDragIndicator />} size="medium" />
          <span className="title">{t(`overview.metric.${metricData.metric}`)}</span>
        </Track>

        <h2>
          {Math.round(metricData.data.left * 100) / 100} / {Math.round(metricData.data.right * 100) / 100}
        </h2>
      </Card>
    </div>
  )
}

export default DraggableCard
