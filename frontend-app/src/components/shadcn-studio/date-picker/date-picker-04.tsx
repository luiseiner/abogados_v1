import { useState, useEffect } from 'react'
import { CalendarIcon } from 'lucide-react'
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

function formatDisplayDate(date: Date | undefined) {
  if (!date) return ''
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatISODate(date: Date | undefined) {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd') // <-- formato ISO para backend
}

function isValidDate(date: Date | undefined) {
  if (!date) return false
  return !isNaN(date.getTime())
}

interface DatePickerWithinInputDemoProps {
  value?: string // ahora puede venir como '2025-10-24'
  onChange?: (event: { target: { value: string } }) => void
}

const DatePickerWithinInputDemo = ({ value, onChange }: DatePickerWithinInputDemoProps) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : new Date()
  )
  const [month, setMonth] = useState<Date | undefined>(date)
  const [displayValue, setDisplayValue] = useState(formatDisplayDate(date))

  useEffect(() => {
    if (value) {
      const parsed = new Date(value)
      if (isValidDate(parsed)) {
        setDate(parsed)
        setMonth(parsed)
        setDisplayValue(formatDisplayDate(parsed))
      }
    }
  }, [value])

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    const display = formatDisplayDate(selectedDate)
    const iso = formatISODate(selectedDate)
    setDate(selectedDate)
    setDisplayValue(display)
    setOpen(false)
    onChange?.({ target: { value: iso } }) // ✅ enviamos en formato YYYY-MM-DD
  }

  return (
    <div className='w-full max-w-xs space-y-2'>
      <div className='relative flex gap-2'>
        <Input
          id='date'
          value={displayValue}
          placeholder='dd/mm/aaaa'
          className='bg-background pr-10'
          readOnly // <-- evita problemas al escribir manualmente
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id='date-picker'
              variant='ghost'
              className='absolute top-1/2 right-2 size-6 -translate-y-1/2'
            >
              <CalendarIcon className='size-3.5' />
              <span className='sr-only'>Pick a date</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className='w-auto overflow-hidden p-0'
            align='end'
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode='single'
              selected={date}
              month={month}
              locale={es}
              onMonthChange={setMonth}
              onSelect={handleSelectDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default DatePickerWithinInputDemo
