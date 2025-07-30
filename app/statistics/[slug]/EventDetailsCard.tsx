"use client"

import { useState, useTransition } from "react"
import { EditEventDialog } from "@/app/[slug]/events/EditEventDialog"
import { Score } from "@/app/[slug]/events/EventCard"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ChevronUp, ChevronDown, Users, XIcon, Loader2, CheckIcon } from "lucide-react"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"
import { Prisma } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { positionBadgeColors, positionShortLabels } from "./columns/utils"
import { ConfirmDataLossDialog } from "./ConfirmDataLossDialog"
import { acceptInvitation, declineInvitation } from "./actions"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "./_components/ConfirmDialog"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"

type EventDetailsCardProps = {
  event: Prisma.EventGetPayload<{
    include: {
      attendees: { include: { member: { select: { firstName: true; lastName: true } }; statistics: true } }
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
  const [isCollapsed, setIsCollapsed] = useState(false)

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
          <Score
            teamName={event.team?.name}
            opponentName={event.opponentName}
            teamScore={event.teamScore}
            opponentScore={event.opponentScore}
          />
          {event.description && (
            <div className="mt-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm">{event.description}</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold">Attendees</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {event.attendees.map(attendee => (
                <li
                  key={attendee.id}
                  className="flex flex-row justify-between items-center p-2 border rounded-lg"
                >
                  <AttendeeCard
                    attendee={attendee}
                    eventSlug={event.slug}
                    enableInvitationResponse={enableInvitationResponse}
                  />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

type AttendeeCardProps = {
  attendee: Prisma.AttendeeGetPayload<{
    include: { member: { select: { firstName: true; lastName: true } } }
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

  const handleAcceptInvitation = () => {
    startStatusTransition(async () => {
      try {
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
        <Badge
          key={`attendee-position-${attendee.id}`}
          variant="outline"
          className={positionBadgeColors["OUTSIDE_HITTER"]}
        >
          {positionShortLabels["OUTSIDE_HITTER"]}
        </Badge>

        <Badge
          variant="outline"
          className={"border-emerald-500 text-emerald-600"}
        >
          Test Position
        </Badge>
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

            <ConfirmDataLossDialog onConfirmAction={handleDeclineInvitation}>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
              >
                <XIcon />
              </Button>
            </ConfirmDataLossDialog>
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
