"use client"

import { useActionState, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { XIcon, Loader2, CheckIcon, PlusIcon, UserCog } from "lucide-react"
import { Prisma } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { positionBadgeColors, positionShortLabels } from "../columns/utils"
import { acceptInvitation, declineInvitation, updateAttendeePositions } from "../actions"
import { toast, useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "../_components/ConfirmDialog"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { PositionsMultiSelect } from "../PositionsMultiSelect"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"

type AttendeeCardProps = {
  attendee: Prisma.AttendeeGetPayload<{
    include: { member: { select: { firstName: true; lastName: true } }; event: { include: { team: true } } }
  }>
  eventSlug: string
  enableInvitationResponses?: boolean
  isFromOtherTeam?: boolean
}

export const AttendeeCard = ({
  attendee,
  eventSlug,
  enableInvitationResponses = false,
  isFromOtherTeam,
}: AttendeeCardProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isStatusUpdating, startStatusTransition] = useTransition()
  const fullName = `${attendee.member.firstName} ${attendee.member.lastName}`
  const session = useSession().data
  const isAdmin = session?.user.teamRoles[attendee.event.team?.slug || ""] === "ADMIN"
  const isCurrentlyLoggedIn = session?.user.members.find(member => member.id === attendee.memberId)
  const shouldShowInvitationResponse = enableInvitationResponses || isCurrentlyLoggedIn || isAdmin

  const handleAcceptInvitation = () => {
    startStatusTransition(async () => {
      try {
        if (isAdmin && searchParams.has("invite")) {
          // If the user is an admin, we can directly accept the invitation without needing a token
          await acceptInvitation(attendee.id)
          toast({ title: "Successfully accepted invitation" })
          return
        }

        const res = await signIn("credentials", {
          token,
          redirect: false,
        })

        if (res?.error) {
          console.error("Login error:", res.error)
          toast({ title: "Invalid token. Could not sign in. Please try again" })
        } else {
          await acceptInvitation(attendee.id)
          router.push(`/statistics/${eventSlug}`)
          toast({ title: "Successfully accepted invitation" })
        }
      } catch (error) {
        console.error(error)
        toast({ title: "Could not accept invitation. Please try again" })
      }
    })
  }

  const handleDeclineInvitation = () => {
    startStatusTransition(async () => {
      try {
        if (isAdmin) {
          // If the user is an admin, we can directly decline the invitation without needing a token
          await declineInvitation(attendee.id)
          toast({ title: "Declined invitation" })
          return
        }

        const res = await signIn("credentials", {
          token,
          redirect: false,
        })

        if (res?.error) {
          console.error("Login error:", res.error)
          toast({ title: "Invalid token. Could not sign in. Please try again" })
        } else {
          await declineInvitation(attendee.id)
          router.push(`/statistics/${eventSlug}`)
          toast({ title: "Declined invitation" })
        }
      } catch (error) {
        console.error(error)
        toast({ title: "Could not decline invitation. Please try again" })
      }
    })
  }

  return (
    <>
      <div>
        <div className="text-sm font-semibold">{fullName}</div>
        <div className="flex gap-1">
          {attendee.positions.length > 0
            ? attendee.positions.map(position => {
                return (
                  <Badge
                    key={`${attendee.id}-${position}`}
                    variant="outline"
                    className={positionBadgeColors[position]}
                  >
                    {positionShortLabels[position]}
                  </Badge>
                )
              })
            : null}
          <PermissionClient teamSlug={attendee.event.team?.slug || ""}>
            <EditPositonsDialog attendee={attendee} />
          </PermissionClient>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isFromOtherTeam && (
          <Badge
            variant="outline"
            className="bg-orange-600 border-orange-600 text-white"
          >
            Guest
          </Badge>
        )}
        <StatusBadge
          status={attendee.status}
          isUpdating={isStatusUpdating}
        />
        {shouldShowInvitationResponse && (
          <>
            <ConfirmDialog
              onConfirmAction={handleAcceptInvitation}
              title="You are attending to the event!"
              description={
                <>
                  Are you sure you are <span className="font-bold">{fullName}</span>?
                </>
              }
              confirmText="Accept"
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
              >
                <CheckIcon />
              </Button>
            </ConfirmDialog>

            <ConfirmDialog
              onConfirmAction={handleDeclineInvitation}
              title="You are declining the event!"
              description={`Are you sure you do not want to attend the event, ${fullName}?`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
              >
                <XIcon />
              </Button>
            </ConfirmDialog>
          </>
        )}
      </div>
    </>
  )
}

type StatusBadgeProps = {
  status: string
  isUpdating?: boolean
}

const StatusBadge = ({ status, isUpdating = false }: StatusBadgeProps) => {
  const statusStyles: Record<typeof status, string> = {
    ACCEPTED: "bg-green-600 border-green-600 text-white",
    PENDING: "bg-gray-100 border-gray-100 text-black",
    DECLINED: "bg-red-600 border-red-600 text-white",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex",
        isUpdating ? statusStyles["PENDING"] : statusStyles[status] ?? statusStyles["PENDING"],
      )}
    >
      {isUpdating ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-1" /> <span>Updating</span>
        </>
      ) : (
        `${status.charAt(0).toUpperCase()}${status.slice(1).toLowerCase()}`
      )}
    </Badge>
  )
}

type EditPositonsDialogProps = {
  attendee: AttendeeCardProps["attendee"]
}

const EditPositonsDialog = ({ attendee }: EditPositonsDialogProps) => {
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)

  const addWithAttendeeId = updateAttendeePositions.bind(null, attendee.id)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      await addWithAttendeeId(formData)
      setShowDialog(false)
      toast({ title: "Edited positions successfully" })
    } catch (error) {
      console.error(error)
      toast({ title: "Could not edit positions. Please try again" })
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
          size="icon"
          className="size-6"
        >
          {attendee.positions.length > 0 ? <PlusIcon /> : <UserCog />}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Position of {attendee.member.firstName} {attendee.member.lastName}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
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
              label="Save"
              loadingLabel="Saving..."
              disabled={isPending}
              type="submit"
              name="action"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
