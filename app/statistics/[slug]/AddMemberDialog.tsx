"use client"

import { useToast } from "@/hooks/use-toast"
import { useActionState, useRef, useState, MouseEvent } from "react"
import { addMember, getAuthToken } from "./actions"
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
import { PlusCircle, Clipboard, Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { Member } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PositionsMultiSelect } from "./PositionsMultiSelect"

type AddMemberDialogProps = {
  eventId: string
  membersNotParticipating: Member[]
  disabled?: boolean
}

export const AddMemberDialog = ({ eventId, membersNotParticipating, disabled }: AddMemberDialogProps) => {
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [copiedInviteLink, setCopiedInviteLink] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const addWithEventId = addMember.bind(null, eventId)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    const action = formData.get("action")

    try {
      await addWithEventId(formData)
      if (action === "add") setShowDialog(false)
      if (action === "add-more") {
        formRef.current?.reset()
      }
      toast({ title: "Member added successfully" })
    } catch (error) {
      console.error(error)
      toast({ title: "Could not add member. Please try again" })
    }

    return null
  }, null)

  const createAndCopyInviteLink = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (copiedInviteLink) return
    try {
      const authToken = await getAuthToken(eventId)
      // TODO: use event slug instead of eventId
      const inviteLink = `${window.location.host}/statistics/invite?event=${eventId}&token=${authToken.token}`
      window.navigator.clipboard.writeText(inviteLink)

      setCopiedInviteLink(true)
      setTimeout(() => {
        setCopiedInviteLink(false)
      }, 2000)
    } catch (error) {
      toast({ title: `${error} Create a guest member for this team first` })
    }
  }

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
          aria-label="Add Member"
          onClick={() => {
            setShowDialog(true)
          }}
          disabled={disabled}
        >
          <PlusCircle className="h-5 w-5" />
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Add a member for the event.</DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
        >
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="member">Team Members</Label>
              <Select name="member">
                <SelectTrigger>
                  <SelectValue placeholder="Select Member" />
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

            <Button
              className={`${copiedInviteLink ? "border-green-600" : ""}`}
              variant="outline"
              onClick={createAndCopyInviteLink}
            >
              <>
                {copiedInviteLink ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
                Copy Invite Link
              </>
            </Button>

            <ButtonWithLoading
              label="Add More"
              loadingLabel="Adding..."
              disabled={isPending}
              value="add-more"
              name="action"
            />

            <ButtonWithLoading
              label="Add"
              loadingLabel="Adding..."
              disabled={isPending}
              type="submit"
              value="add"
              name="action"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
