"use client"

import { useToast } from "@/hooks/use-toast"
import { useActionState, useState } from "react"
import { addPlayer } from "./actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { Person } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PositionsMultiSelect } from "./PositionsMultiSelect"

type AddPlayerDialogProps = {
  gameId: string
  membersNotParticipating: Person[]
  disabled?: boolean
}

export const AddPlayerDialog = ({ gameId, membersNotParticipating, disabled }: AddPlayerDialogProps) => {
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const addPlayerWithGameId = addPlayer.bind(null, gameId)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      await addPlayerWithGameId(formData)
      setShowDialog(false)
      toast({ title: "Player added successfully" })
    } catch (error) {
      console.error(error)
      return "Could not add player. Please try again"
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
          className="h-10"
          variant={"outline"}
          size="sm"
          aria-expanded={showDialog}
          aria-label="Add Player"
          onClick={() => {
            setShowDialog(true)
          }}
          disabled={disabled}
        >
          <PlusCircle className="h-5 w-5" />
          Add Player
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
          <DialogDescription>Add a player for the game.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="member">Team Members</Label>
              <Select name="member">
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {membersNotParticipating.map(member => (
                    <SelectItem
                      key={member.id}
                      value={member.id}
                    >
                      {member.nickName ? member.nickName : `${member.firstName} ${member.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positions">Positions</Label>
              <PositionsMultiSelect />
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
              label="Add"
              loadingLabel="Adding..."
              disabled={isPending}
              type="submit"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
