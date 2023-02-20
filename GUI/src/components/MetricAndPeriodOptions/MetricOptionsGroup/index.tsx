import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../Button'
import { FormDatepicker } from '../../FormElements'
import Track from '../../Track'
import { Option } from '../types'
import './styles.scss'
import { formatDate } from '../../../util/charts-utils'

type DatePickHandler = ((startDate: string, endDate: string) => void) | undefined
type StartEndTimes = { start: Date; end: Date }

interface MetricOptionsGroupProps {
  label: string
  dateFormat?: string
  options: Option[]
  onChange: (value: string) => void
  onDatePicked?: DatePickHandler
}

const defaultProps: MetricOptionsGroupProps = {
  dateFormat: 'EEE MMM dd yyyy',
  label: '',
  options: [],
  onChange: (_) => { },
}

const MetricOptionsGroup: React.FC<MetricOptionsGroupProps> = ({
  label,
  dateFormat,
  options,
  onChange,
  onDatePicked,
}) => {
  const { t } = useTranslation()
  const [selectedValue, setSelectedValue] = useState(options[0].id)
  const [startEndTimes, setStartEndTimes] = useState<StartEndTimes>({ start: new Date(), end: new Date() })

  useEffect(() => {
    onChange(selectedValue)

    const startDate = new Date()
    const endDate = new Date()

    switch (selectedValue) {
      case 'today':
      case 'period':
        setStartEndTimes({ start: startDate, end: endDate })
        break
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1)
        endDate.setDate(endDate.getDate() - 1)
        setStartEndTimes({ start: startDate, end: endDate })
        break
      case 'last30days':
        startDate.setDate(startDate.getDate() - 30)
        setStartEndTimes({ start: startDate, end: endDate })
        break
      case 'month':
        changeMonthDate(new Date())
        break
      default:
        setStartEndTimes({ start: startDate, end: endDate })
    }
  }, [selectedValue])

  useEffect(() => {
    onDatePicked?.(dateToStr(startEndTimes.start), dateToStr(startEndTimes.end))
  }, [startEndTimes])

  const additionalKey = useMemo(() => options.find((x) => x.id === selectedValue)?.additionalKey, [selectedValue])

  const dateToStr = (date: Date) => {
    return formatDate(date, dateFormat ?? 'EEE MMM dd yyyy')
  }

  const changeMonthDate = (date: Date) => {
    const sd = new Date(date)
    const ed = new Date(date)
    sd.setDate(1)
    ed.setMonth(ed.getMonth() + 1)
    ed.setDate(0)
    setStartEndTimes({ start: sd, end: ed })
  }
  const changeStartDate = (date: Date) => {
    setStartEndTimes((st) => (date > st.end ? { end: date, start: date } : { ...st, start: date }))
  }
  const changeEndDate = (date: Date) => {
    setStartEndTimes((st) => (date < st.start ? { end: date, start: date } : { ...st, end: date }))
  }

  return (
    <Track
      gap={130}
      align="left"
    >
      <div className="option-label">{label}</div>
      <Track
        direction="vertical"
        align="left"
        gap={additionalKey ? 10 : 0}
        isFlex={true}
      >
        <Track isMultiline={true}>
          {options.map((option) => (
            <Button
              key={option.id}
              onClick={() => setSelectedValue(option.id)}
              appearance={option.id === selectedValue ? 'primary' : 'secondary'}
              size="s"
              style={{ marginRight: '.5rem', marginBottom: '.3rem', marginTop: '.3rem' }}
            >
              {t(option.labelKey)}
            </Button>
          ))}
        </Track>
        <Track>
          {additionalKey === 'monthpicker' && (
            <FormDatepicker
              label=""
              hideLabel
              name="start"
              value={startEndTimes.start}
              onChange={(date) => changeMonthDate(date)}
              onBlur={() => { }}
              monthPicker
            />
          )}
          {additionalKey === 'customperiodpicker' && (
            <Track gap={20}>
              <FormDatepicker
                label=""
                hideLabel
                name="start"
                value={startEndTimes.start}
                onChange={(date) => changeStartDate(date)}
                onBlur={() => { }}
              />
              {t('general.until')}
              <FormDatepicker
                label={t('general.until')}
                hideLabel
                name="end"
                value={startEndTimes.end}
                onChange={(date) => changeEndDate(date)}
                onBlur={() => { }}
              />
            </Track>
          )}
        </Track>
      </Track>
    </Track>
  )
}

MetricOptionsGroup.defaultProps = defaultProps
export default MetricOptionsGroup
