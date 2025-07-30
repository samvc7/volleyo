import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DATE_FORMAT } from "@/app/utils"
import { Input } from "@/components/ui/input"

type DatePickerProps = {
  id?: string
  name?: string
  date?: Date
  onDateChange: (date: Date | undefined) => void
}

export function DatePicker({ id, name, date, onDateChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            id={id}
            type="text"
            name={name}
            value={date ? format(date, DATE_FORMAT) : ""}
            onChange={() => {}}
            placeholder="Pick a date"
            className={cn("w-full pl-9 text-left", !date && "text-muted-foreground")}
            required
          />
          <CalendarIcon
            className={cn(
              "absolute left-3 top-3 h-4 w-4 pointer-events-none",
              !date && "text-muted-foreground",
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          id={id}
          mode="single"
          selected={date}
          onSelect={newDate => onDateChange(newDate)}
          initialFocus
          required
        />
      </PopoverContent>
    </Popover>
  )
}
