import { add, differenceInCalendarDays, differenceInHours, format } from 'date-fns'

export const dateFormatter = (startDate: string, endDate: string, date: string) => {
  return format(new Date(date), startDate === endDate ? 'hh:mm a' : 'dd-MM-yyyy')
}

export const getTicks = (startDate: string, endDate: string, start: Date, end: Date, skip: number) => {
  const ticks = [start.getTime()]
  const inDays: boolean = startDate !== endDate

  const diff = inDays
    ? differenceInCalendarDays(end, start)
    : differenceInHours(new Date(`${startDate} 24:00:00`), new Date(`${endDate} 00:00:00`))
  const num = inDays ? (diff <= 30 ? diff : skip) : diff

  const current = start,
    velocity = Math.round(diff / (num - 1))

  for (let i = 1; i < num - 1; i++) {
    ticks.push(
      add(current, { days: inDays ? i * velocity : undefined, hours: inDays ? undefined : i * velocity }).getTime(),
    )
  }

  ticks.push(end.getTime())

  return ticks
}
