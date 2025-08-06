import { AttendeeStatus, Prisma } from "@prisma/client"
import { Permission } from "@/components/ui/custom/Permission"
import { AttendeeCard } from "./AttendeeCard"
import { isFromOtherTeam } from "../actions"
import { AddMembers } from "./AddMembers"

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
  return (
    <div className="mt-4">
      <div className="flex mb-4 items-center">
        <h3 className="font-semibold">Attendees</h3>
        <Permission teamSlug={event.team?.slug ?? ""}>
          <AddMembers event={event} />
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
