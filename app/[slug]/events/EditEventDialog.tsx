"use client"

import { useActionState, useState } from "react"
import { SquarePen } from "lucide-react"
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

import { toast } from "@/hooks/use-toast"

import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { DatePicker } from "@/app/[slug]/events/DatePicker"
import { updateEvent } from "./actions"
import { EventWithRelations } from "./page"

type EditEventDialogProps = {
  event: EventWithRelations
}

export const EditEventDialog = ({ event }: EditEventDialogProps) => {
  const [showDialog, setShowDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(event.date)

  const [state, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    if (!selectedDate) {
      console.error("No date selected")
      return null
    }

    const updateWithIdAndDate = updateEvent.bind(null, event.id, selectedDate)

    try {
      updateWithIdAndDate(formData)
      setShowDialog(false)
      toast({ title: "Saved Event" })
    } catch (error) {
      console.error(error)
      return "Could not save event. Please try again"
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
          variant="ghost"
          aria-expanded={showDialog}
          aria-label="Edit Event"
          className="h-8 w-8 p-0 ml-auto"
          onClick={() => {
            setShowDialog(true)
          }}
        >
          <span className="sr-only">Edit event</span>
          <SquarePen className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Make changes to the event information.</DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event.description ?? undefined}
                placeholder="Describe this event with useful information like address, game format, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  id="date"
                  name="date"
                  date={selectedDate ? selectedDate : new Date(event.date)}
                  onDateChange={setSelectedDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  defaultValue={selectedDate ? selectedDate.toTimeString().slice(0, 5) : ""}
                  onChange={data => {
                    const [hours, minutes] = data.target.value.split(":")
                    setSelectedDate(prev => {
                      if (!prev || !hours || !minutes) return prev
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
                defaultValue={event.location ?? undefined}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  name="team"
                  defaultValue={event.team?.name ?? "Team"}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  name="opponent"
                  defaultValue={event.opponentName ?? undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team-score">Team Score</Label>
                <Input
                  id="team-score"
                  name="team-score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={event.teamScore ?? undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent-score">Opponent Score</Label>
                <Input
                  id="opponent-score"
                  name="opponent-score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={event.opponentScore ?? undefined}
                />
              </div>
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
