import { prisma } from "@/prisma/singlePrismaClient"
import { EventDetailsCard } from "../[slug]/EventDetailsCard"

type InvitePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { event } = await searchParams

  const eventToInvite = await prisma.event.findUnique({
    where: { id: event as string },
    include: {
      attendees: { include: { member: true, statistics: true } },
      team: { include: { members: { include: { member: true } } } },
    },
  })

  if (!eventToInvite) {
    return <h1 className="text-center text-2xl font-bold">Event not found</h1>
  }

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold">
        You were invited to {eventToInvite.title}
      </h1>
      <EventDetailsCard
        event={eventToInvite}
        enableCollapse
        enableInvitationResponse
      />
    </main>
  )
}
