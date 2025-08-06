import { AttendeeStatus, Prisma } from "@prisma/client"
import { Permission } from "@/components/ui/custom/Permission"
import { AddMembersDialog } from "../AddMembersDialog"
import { AttendeeCard } from "./AttendeeCard"
import { prisma } from "@/prisma/singlePrismaClient"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isFromOtherTeam } from "../actions"

type AttendeesCardProps = {
  event: Prisma.EventGetPayload<{
    include: {
      team?: true
    }
  }>
  attendees: {
    status: AttendeeStatus
    attendees: Prisma.AttendeeGetPayload<{
      include: {
        member: { select: { id: true; firstName: true; lastName: true } }
        statistics: true
        event: { include: { team: true } }
      }
    }>[]
  }[]
  enableInvitationResponses?: boolean
}

export const Attendees = async ({ event, attendees, enableInvitationResponses }: AttendeesCardProps) => {
  const session = await getAuthSession()
  if (!session) {
    redirect("/login")
  }

  const isAdmin = session.user.teamRoles[event.team?.slug || ""] === "ADMIN"
  const teamsOfAdmin = isAdmin
    ? Object.keys(session.user.teamRoles).filter(teamSlug => teamSlug !== event.team?.slug)
    : []

  const membersNotParticipating = await prisma.member.findMany({
    where: {
      teams: { some: { team: { slug: event.team?.slug }, removedAt: null } },
      attendees: { none: { eventId: event.id } },
    },
  })

  const otherTeamMembersAndNotParticipating = await prisma.member.findMany({
    where: {
      teams: { some: { team: { slug: { in: teamsOfAdmin } }, removedAt: null } },
      attendees: { none: { eventId: event.id } },
    },
  })

  return (
    <div className="mt-4">
      <div className="flex mb-4 items-center">
        <h3 className="font-semibold">Attendees</h3>
        <Permission teamSlug={event.team?.slug ?? ""}>
          <div className="flex gap-1 ml-auto">
            <AddMembersDialog
              event={event}
              membersNotParticipating={membersNotParticipating}
              otherTeamMembers={otherTeamMembersAndNotParticipating}
              disabled={
                membersNotParticipating.length === 0 && otherTeamMembersAndNotParticipating.length === 0
              }
            />
          </div>
        </Permission>
      </div>

      {Object.keys(attendees).length === 0 ? (
        <p className="text-sm text-muted-foreground">No attendees yet. Invite members to join.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(attendees).map(([status, attendeesList]) => (
            <ul
              key={`${status}-attendees-list`}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
            >
              {attendeesList.attendees.map(async attendee => (
                <li
                  key={attendee.id}
                  className="flex flex-row justify-between items-center p-2 border rounded-lg min-h-16"
                >
                  <AttendeeCard
                    attendee={attendee}
                    eventSlug={event.slug}
                    enableInvitationResponses={enableInvitationResponses}
                    isFromOtherTeam={await isFromOtherTeam(attendee.id, event.team?.id || "")}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}
    </div>
  )
}
