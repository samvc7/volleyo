"use client"

import { useToast } from "@/hooks/use-toast"
import { useActionState, useState, MouseEvent } from "react"
import { addNotAttendeeMembers, getAuthToken } from "./actions"
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
import { MultiSelect } from "@/components/ui/multi-select"

type AddMemberDialogProps = {
  eventId: string
  membersNotParticipating: Member[]
  otherTeamMembers?: Member[]
  disabled?: boolean
}

export const AddMembersDialog = ({
  eventId,
  membersNotParticipating,
  otherTeamMembers,
  disabled,
}: AddMemberDialogProps) => {
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [copiedInviteLink, setCopiedInviteLink] = useState(false)

  const addWithEventId = addNotAttendeeMembers.bind(null, eventId)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      await addWithEventId(formData)
      setShowDialog(false)
      toast({ title: "Members added successfully" })
    } catch (error) {
      console.error(error)
      toast({ title: "Could not add members. Please try again" })
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
          aria-label="Add Members"
          onClick={() => {
            setShowDialog(true)
          }}
          disabled={disabled}
        >
          <PlusCircle className="h-5 w-5" />
          Add Members
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>Add members for the event.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="space-y-2 pb-4">
            <Label htmlFor="members">Team Members</Label>
            <MultiSelect
              id="members"
              name="members"
              options={membersNotParticipating.map(member => {
                const fullName = member.nickName ? member.nickName : `${member.firstName} ${member.lastName}`
                return {
                  value: member.id,
                  label: fullName,
                }
              })}
              placeholder="Select Members"
              onValueChange={() => {}}
              className="min-w-64"
            />
          </div>

          {otherTeamMembers && otherTeamMembers.length > 0 && (
            <div className="space-y-2 pb-4">
              <Label htmlFor="members">From Other Teams</Label>
              <MultiSelect
                id="other-team-members"
                name="other-team-members"
                options={otherTeamMembers.map(member => {
                  const fullName = member.nickName
                    ? member.nickName
                    : `${member.firstName} ${member.lastName}`
                  return {
                    value: member.id,
                    label: fullName,
                  }
                })}
                placeholder="Select Other Members"
                onValueChange={() => {}}
                className="min-w-64"
              />
            </div>
          )}

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
              label="Add"
              loadingLabel="Adding..."
              disabled={isPending}
              type="submit"
              value="add"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
