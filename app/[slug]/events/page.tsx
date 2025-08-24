import { prisma } from "@/prisma/singlePrismaClient"
import { NewEventDialog } from "./NewEventDialog"
import { EventCardLink } from "./EventCard"
import { Prisma } from "@prisma/client"
import { Separator } from "@/components/ui/separator"
import { Volleyball } from "lucide-react"
import { Permission } from "@/components/ui/custom/Permission"
import { NoneFound } from "@/components/ui/custom/NoneFound"

export default async function EventsView({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { from, to } = await searchParams
  const fromDate = new Date(from as string)
  fromDate.setHours(0, 0, 0, 0)
  const toDate = new Date(to as string)
  toDate.setHours(23, 59, 59, 999)

  const events = await prisma.event.findMany({
    include: { attendees: { include: { statistics: true } }, team: true },
    where: {
      team: { slug },
      date: {
        not: null,
        ...(from && to ? { gte: fromDate, lte: toDate } : {}),
      },
    },
    orderBy: { date: "desc" },
  })

  const today = new Date()
  const [upcomingEvents, pastEvents] = events.reduce<[EventWithRelations[], EventWithRelations[]]>(
    ([upcoming, past], event) => {
      if (!event.date) return [upcoming, past]

      if (event.date >= today) {
        upcoming.push(event)
      } else {
        past.push(event)
      }

      return [upcoming, past]
    },
    [[], []],
  )

  if (!events.length) {
    return (
      <NoneFound
        title="No events yet."
        description="You haven't added any events yet. Start planning your events and document statistics by adding new events."
        icon={Volleyball}
      >
        <Permission teamSlug={slug}>
          <NewEventDialog />
        </Permission>
      </NoneFound>
    )
  }

  return (
    <>
      <Permission teamSlug={slug}>
        <NewEventDialog triggerClassName="ml-auto" />
      </Permission>
      {upcomingEvents.length ? (
        <ul className="w-full flex flex-col gap-4 mt-4 mb-4">
          {upcomingEvents.map(event => (
            <li key={event.id}>
              <EventCardLink event={event} />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center w-full gap-4">
        <Separator allowShrink />
        <span className="px-4 whitespace-nowrap text-muted-foreground text-sm">Past Events</span>
        <Separator allowShrink />
      </div>

      {pastEvents.length ? (
        <ul className="w-full flex flex-col gap-4 mt-4">
          {pastEvents.map(event => (
            <li key={event.id}>
              <EventCardLink event={event} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

export type EventWithRelations = Prisma.EventGetPayload<{
  include: { attendees: { include: { statistics: true } }; team?: true }
}>
