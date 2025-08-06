import { Prisma, AttendeeStatus } from "@prisma/client"

export const sortAndOrder = (
  attendees: Prisma.AttendeeGetPayload<{
    include: {
      member: { select: { id: true; firstName: true; lastName: true } }
      statistics: true
      event: { include: { team: true } }
    }
  }>[],
) => {
  const groupedAttendees = attendees.reduce((acc, attendee) => {
    const status = attendee.status
    if (!acc[status]) acc[status] = []
    acc[status].push(attendee)
    return acc
  }, {} as Record<AttendeeStatus, typeof attendees>)

  const orderedStatuses: AttendeeStatus[] = ["ACCEPTED", "PENDING", "DECLINED"]
  const groupedAndOrdered = orderedStatuses.map(status => ({
    status,
    attendees: groupedAttendees?.[status] ?? [],
  }))

  return groupedAndOrdered
}
