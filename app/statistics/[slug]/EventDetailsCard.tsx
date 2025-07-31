"use client"

import { use, useActionState, useRef, useState, useTransition } from "react"
import { EditEventDialog } from "@/app/[slug]/events/EditEventDialog"
import { Score } from "@/app/[slug]/events/EventCard"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ChevronUp, ChevronDown, Users, XIcon, Loader2, CheckIcon, PlusIcon, UserCog } from "lucide-react"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"
import { Prisma } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { positionBadgeColors, positionShortLabels } from "./columns/utils"
import { ConfirmDataLossDialog } from "./ConfirmDataLossDialog"
import { acceptInvitation, declineInvitation, updateAttendeePositions } from "./actions"
import { toast, useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "./_components/ConfirmDialog"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { isEventCompetitive } from "../util"
import { PositionsMultiSelect } from "./PositionsMultiSelect"
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

type EventDetailsCardProps = {
  event: Prisma.EventGetPayload<{
    include: {
      attendees: {
        include: {
          member: { select: { firstName: true; lastName: true } }
          statistics: true
          event: { include: { team: true } }
        }
      }
      team?: true
    }
  }>
  enableCollapse?: boolean
  enableInvitationResponse?: boolean
}

export const EventDetailsCard = ({
  event,
  enableCollapse = true,
  enableInvitationResponse,
}: EventDetailsCardProps) => {
  const session = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isAdmin = session.data?.user.teamRoles[event.team?.slug || ""] === "ADMIN"

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{event.title}</CardTitle>
            <CardDescription className="inline-flex items-center gap-2">
              {event.date ? (
                <>
                  📅 {format(event.date, DATE_FORMAT)} 🕒 {format(event.date, TIME_FORMAT)}
                </>
              ) : (
                <>📅 TBA</>
              )}
              | 📍 {event.location || "TBA"} |
              <span className="flex items-center gap-1">
                <Users size={14} />
                {event.attendees.length ?? 0}
              </span>
            </CardDescription>
          </div>

          <PermissionClient teamSlug={event.team?.slug || ""}>
            <EditEventDialog event={event} />
          </PermissionClient>

          {enableCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(prev => !prev)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          {isEventCompetitive(event.type) && (
            <Score
              teamName={event.team?.name}
              opponentName={event.opponentName}
              teamScore={event.teamScore}
              opponentScore={event.opponentScore}
            />
          )}
          {event.description && (
            <div className="mt-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm">{event.description}</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold">Attendees</h3>
            {event.attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendees yet. Invite members to join.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {event.attendees.map(attendee => (
                  <li
                    key={attendee.id}
                    className="flex flex-row justify-between items-center p-2 border rounded-lg min-h-16"
                  >
                    <AttendeeCard
                      attendee={attendee}
                      eventSlug={event.slug}
                      enableInvitationResponse={enableInvitationResponse || isAdmin}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

type AttendeeCardProps = {
  attendee: Prisma.AttendeeGetPayload<{
    include: { member: { select: { firstName: true; lastName: true } }; event: { include: { team: true } } }
  }>
  eventSlug: string
  enableInvitationResponse?: boolean
}

const AttendeeCard = ({ attendee, eventSlug, enableInvitationResponse = false }: AttendeeCardProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isStatusUpdating, startStatusTransition] = useTransition()
  const fullName = `${attendee.member.firstName} ${attendee.member.lastName}`
  const isAdmin = useSession().data?.user.teamRoles[attendee.event.team?.slug || ""] === "ADMIN"

  const handleAcceptInvitation = () => {
    startStatusTransition(async () => {
      try {
        if (isAdmin) {
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
          {isAdmin ? <EditPositonsDialog attendee={attendee} /> : null}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <StatusBadge
          status={attendee.status}
          isUpdating={isStatusUpdating}
        />
        {enableInvitationResponse && (
          <>
            <ConfirmDialog
              onConfirmAction={handleAcceptInvitation}
              title="You are accepting the invitation!"
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
              description={`Are you sure you want to decline the event for ${fullName}?`}
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
