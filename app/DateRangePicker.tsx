"use client"

import React, { useEffect } from "react"
import { format, getYear, isWithinInterval, set, subDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DATE_FORMAT, DATE_ISO_FORMAT, getCurrentSemesterRange } from "./utils"
import { usePathname, useRouter } from "next/navigation"

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const pathname = usePathname()
  const shouldRender = !pathname.includes("members")

  const [from, to] = getCurrentSemesterRange()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  })

  useEffect(() => {
    if (date?.from && date?.to) {
      const params = new URLSearchParams()
      params.set("from", format(date.from, DATE_ISO_FORMAT))
      params.set("to", format(date.to, DATE_ISO_FORMAT))

      router.push(`${pathname}?${params.toString()}`)
    }
  }, [date])

  const handleSelectPreset = (value: string) => {
    const date = new Date()

    switch (value) {
      case "week":
        setDate({ from: subDays(date, 7), to: date })
        break
      case "month":
        setDate({ from: subDays(date, 30), to: date })
        break
      case "year":
        setDate({ from: subDays(date, 365), to: date })
        break
      default:
        setDate({ from: subDays(new Date(), 30), to: new Date() })
    }
  }

  if (!shouldRender) return null
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, DATE_FORMAT)} - {format(date.to, DATE_FORMAT)}
                </>
              ) : (
                format(date.from, DATE_FORMAT)
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex flex-col space-y-2 w-auto p-2"
          align="start"
        >
          <Select onValueChange={handleSelectPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
