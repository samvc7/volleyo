"use client"

import { ReactNode, useActionState, useState } from "react"
import { Loader2, PlusCircle } from "lucide-react"
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
import { MultiSelect } from "@/components/ui/multi-select"
import { Person } from "@prisma/client"
import { toast } from "@/hooks/use-toast"
import { createGame } from "./actions"
import { useParams } from "next/navigation"

type ParticipantsNamesAndID = Pick<Person, "id" | "firstName" | "lastName" | "nickName">

export const NewGameDialog = ({
  participants,
  children,
}: {
  participants: ParticipantsNamesAndID[]
  children: ReactNode
}) => {
  const { slug } = useParams() as { slug: string }

  const [showNewGamedialog, setShowNewGameDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  const [state, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    if (!selectedDate) {
      console.error("No date selected")
      return null
    }

    const createGameWithDateAndTeamSlug = createGame.bind(null, slug, selectedDate)

    try {
      createGameWithDateAndTeamSlug(formData)
      setShowNewGameDialog(false)
      toast({ title: "Team member added successfully" })
    } catch (error) {
      console.error(error)
      return "Could not create new team member. Please try again"
    }

    return null
  }, null)

  return (
    <Dialog
      open={showNewGamedialog}
      onOpenChange={setShowNewGameDialog}
    >
      <DialogTrigger
        className="flex"
        asChild
      >
        <Button
          variant={"outline"}
          aria-expanded={showNewGamedialog}
          aria-label="Create Game"
          onClick={() => {
            setShowNewGameDialog(true)
          }}
          className="ml-auto"
        >
          <PlusCircle className="h-5 w-5" />
          Create Game
        </Button>
      </DialogTrigger>
      {children}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Game</DialogTitle>
          <DialogDescription>
            Add a new tournament, single game, training, tuneup etc. to manage statistics.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
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
                placeholder="Describe this game with useful information like address, game format, etc."
              />
            </div>
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
              <Label htmlFor="participants">Participants</Label>
              <MultiSelect
                id="participants"
                name="participants"
                options={parseParticipants(participants)}
                onValueChange={() => {}}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewGameDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const parseParticipants = (participants: ParticipantsNamesAndID[]) => {
  return participants.map(p => ({
    value: p.id,
    label: p.nickName ? p.nickName : `${p.firstName} ${p.lastName}`,
  }))
}
