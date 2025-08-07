import { prisma } from "@/prisma/singlePrismaClient"
import { EventDetailsCard } from "../[slug]/EventDetailsCard"
import { Attendees } from "../[slug]/_attendees/Attendees"
import { sortAndOrder } from "../[slug]/util"

type InvitePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { event, token } = await searchParams

  const eventToInvite = await prisma.event.findUnique({
    where: { slug: event as string },
    include: {
      attendees: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true } },
          statistics: true,
          event: { include: { team: true } },
        },
        orderBy: [{ member: { firstName: "asc" } }],
      },
      team: { include: { members: { include: { member: true } } } },
    },
  })

  const isTokenValid = await prisma.user.findFirst({
    where: {
      authToken: {
        token: token as string,
      },
    },
  })

  if (!eventToInvite) {
    return <h1 className="text-center text-2xl font-bold">Event not found</h1>
  }

  const { attendees, ...eventWithoutAttendees } = eventToInvite
  const groupedAndOrdered = sortAndOrder(attendees)

  return (
    <>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold">
        You were invited to {eventToInvite.title}
      </h1>
      <EventDetailsCard event={eventToInvite} />
      <Attendees
        event={eventWithoutAttendees}
        attendees={groupedAndOrdered}
        enableInvitationResponses={!!isTokenValid}
      />
    </>
  )
}
