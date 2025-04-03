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

import { Game } from "@prisma/client"
import { toast } from "@/hooks/use-toast"

import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { DatePicker } from "@/app/[slug]/games/DatePicker"
import { updateGame } from "./actions"

type EditGameDialogProps = {
  game: Game
}

export const EditGameDialog = ({ game }: EditGameDialogProps) => {
  const [showDialog, setShowDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(game.date)
  console.log("🚀 ~ EditGameDialog ~ selectedDate:", selectedDate)

  const [state, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    if (!selectedDate) {
      console.error("No date selected")
      return null
    }

    const updateGameWithIdAndDate = updateGame.bind(null, game.id, selectedDate)

    try {
      updateGameWithIdAndDate(formData)
      setShowDialog(false)
      toast({ title: "Saved game" })
    } catch (error) {
      console.error(error)
      return "Could not save game. Please try again"
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
          aria-label="Edit Game"
          className="h-8 w-8 p-0 ml-auto"
          onClick={() => {
            setShowDialog(true)
          }}
        >
          <span className="sr-only">Edit game</span>
          <SquarePen className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>Make changes to the game information.</DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={game.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={game.description ?? undefined}
                placeholder="Describe this game with useful information like address, game format, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  id="date"
                  name="date"
                  date={selectedDate ? selectedDate : new Date(game.date)}
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
                defaultValue={game.location ?? undefined}
              />
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="my-team">My Team</Label>
                <Input
                  id="my-team"
                  name="my-team"
                  defaultValue={"My Team"}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  name="opponent"
                  defaultValue={"insert opponent name"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-score">Home Score</Label>
                <Input
                  id="home-score"
                  name="home-score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={game.teamScore ?? undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away-score">Away Score</Label>
                <Input
                  id="away-score"
                  name="away-score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={game.opponentScore ?? undefined}
                />
              </div>
            </div> */}
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
