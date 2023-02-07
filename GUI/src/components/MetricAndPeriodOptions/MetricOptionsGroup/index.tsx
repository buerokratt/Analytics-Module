import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../Button'
import { FormDatepicker } from '../../FormElements'
import Track from '../../Track'
import { Option } from '../types'

type DatePickHandler = ((startDate: string, endDate: string) => void) | undefined
type StartEndTimes = { start: Date; end: Date }

interface MetricOptionsGroupProps {
  label: string
  options: Option[]
  onChange: (value: string) => void
  onDatePicked?: DatePickHandler
}

const MetricOptionsGroup: React.FC<MetricOptionsGroupProps> = ({ label, options, onChange, onDatePicked }) => {
  const { t } = useTranslation()
  const [selectedValue, setSelectedValue] = useState(options[0].id)
  const [startEndTimes, setStartEndTimes] = useState<StartEndTimes>({ start: new Date(), end: new Date() })

  useEffect(() => {
    onChange(selectedValue)

    const sd = new Date()
    const ed = new Date()

    switch (selectedValue) {
      case 'today':
      case 'period':
        setStartEndTimes({ start: sd, end: ed })
        break
      case 'yesterday':
        sd.setDate(sd.getDate() - 1)
        ed.setDate(ed.getDate() - 1)
        setStartEndTimes({ start: sd, end: ed })
        break
      case 'last30days':
        sd.setDate(sd.getDate() - 30)
        setStartEndTimes({ start: sd, end: ed })
        break
      case 'month':
        changeMonthDate(new Date())
        break
      default:
        setStartEndTimes({ start: sd, end: ed })
    }
  }, [selectedValue])

  useEffect(() => {
    onDatePicked?.(dateToStr(startEndTimes.start), dateToStr(startEndTimes.end))
  }, [startEndTimes])

  const additionalKey = useMemo(() => options.find((x) => x.id === selectedValue)?.additionalKey, [selectedValue])

  const dateToStr = (date: Date) => {
    return date.toDateString()
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
      {label}
      <Track
        direction="vertical"
        align="left"
        gap={additionalKey ? 10 : 0}
      >
        <Track>
          {options.map((option) => (
            <Button
              key={option.id}
              onClick={() => setSelectedValue(option.id)}
              appearance={option.id === selectedValue ? 'primary' : 'secondary'}
              size="s"
              style={{ marginRight: '.5rem' }}
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
              onBlur={() => {}}
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
                onBlur={() => {}}
              />
              {t('general.until')}
              <FormDatepicker
                label={t('general.until')}
                hideLabel
                name="end"
                value={startEndTimes.end}
                onChange={(date) => changeEndDate(date)}
                onBlur={() => {}}
              />
            </Track>
          )}
        </Track>
      </Track>
    </Track>
  )
}

export default MetricOptionsGroup
