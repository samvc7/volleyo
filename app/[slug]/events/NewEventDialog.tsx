"use client"

import { useActionState, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "./DatePicker"
import { toast } from "@/hooks/use-toast"
import { createEvent } from "./actions"
import { useParams } from "next/navigation"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventType } from "@prisma/client"

type NewEventDialogProps = {
  triggerClassName?: string
  forceRedirect?: boolean
}

export const NewEventDialog = ({ triggerClassName }: NewEventDialogProps) => {
  const { slug } = useParams() as { slug: string }

  const [showDialog, setShowDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    if (!selectedDate) {
      console.error("No date selected")
      return null
    }

    const createWithDateAndTeamSlug = createEvent.bind(null, slug, selectedDate)

    try {
      createWithDateAndTeamSlug(formData)
      setShowDialog(false)
      setSelectedDate(undefined)
      toast({ title: "New event added" })
    } catch (error) {
      console.error(error)
      return "Could not add new event. Please try again"
    }

    return null
  }, null)

  return (
    <Dialog
      open={showDialog}
      onOpenChange={setShowDialog}
    >
      <DialogTrigger
        className="flex"
        asChild
      >
        <Button
          variant={"outline"}
          aria-expanded={showDialog}
          aria-label="Add Event"
          onClick={() => {
            setShowDialog(true)
          }}
          className={triggerClassName}
        >
          <PlusCircle className="h-5 w-5" />
          Add Event
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>
            Add a new tournament, single game, training, tuneup etc. to manage statistics.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventType).map(type => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe this event with useful information like address, game format, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  id="date"
                  name="date"
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  onChange={data => {
                    const [hours, minutes] = data.target.value.split(":")
                    setSelectedDate(prev => {
                      if (!prev) return prev
                      prev.setHours(parseInt(hours), parseInt(minutes))
                      return prev
                    })
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <ButtonWithLoading
              label="Save"
              loadingLabel="Saving..."
              disabled={isPending}
              type="submit"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
