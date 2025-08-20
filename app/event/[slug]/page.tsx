import { DataTable } from "@/app/event/[slug]/data-table"
import { Statistics } from "./columns"
import { columns } from "./columns"
import { prisma } from "@/prisma/singlePrismaClient"
import { EventDetailsCard } from "./EventDetailsCard"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import CourtTracker from "./_court-tracker/CourtTracker"
import { StatisticsProvider } from "./StatisticsProvider"
import { SaveButton } from "./Savebutton"
import { Permission } from "@/components/ui/custom/Permission"
import { isEventCompetitive } from "../util"
import { Attendees } from "./_attendees/Attendees"
import { sortAndOrder } from "./util"

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getAuthSession()
  if (!session) {
    redirect("/login")
  }

  const slug = (await params).slug
  const event = await prisma.event.findUnique({
    where: { slug: slug },
    include: {
      attendees: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true } },
          statistics: true,
          event: { include: { team: true } },
        },
        orderBy: [{ member: { firstName: "asc" } }],
      },
      team: true,
    },
  })

  if (!event) {
    return <h1>Event not found</h1>
  }

  const { attendees, ...eventWithoutAttendees } = event
  const groupedAndOrdered = sortAndOrder(attendees)

  const statistics = event?.attendees.map(attendee => {
    const { member, ...statisticData } = attendee
    return {
      ...statisticData,
      name: `${member.firstName} ${member.lastName} ${
        attendee.playerNumber ? `#${attendee.playerNumber}` : ""
      }`,
      attendeeId: attendee.id,
    }
  }) as Statistics[]

  const isAdmin = session.user.teamRoles[event.team?.slug ?? ""] === "ADMIN"

  return (
    <>
      {isEventCompetitive(event.type) ? (
        <Tabs
          className="flex flex-col"
          defaultValue="details"
        >
          <StatisticsProvider
            initialData={statistics}
            eventSlug={event.slug}
          >
            <div className="flex gap-4">
              <TabsList className="w-full gap-4">
                <TabsTrigger
                  className="w-full"
                  value={"details"}
                >
                  Details
                </TabsTrigger>
                <Permission teamSlug={event.team?.slug ?? ""}>
                  <TabsTrigger
                    className="w-full"
                    value={"court"}
                  >
                    Court
                  </TabsTrigger>
                </Permission>
                <TabsTrigger
                  className="w-full"
                  value={"stats"}
                >
                  Statistics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              className="mt-4"
              value="details"
            >
              <EventDetailsCard event={event} />
              <Attendees
                event={eventWithoutAttendees}
                attendees={groupedAndOrdered}
              />
            </TabsContent>

            <Permission teamSlug={event.team?.slug ?? ""}>
              <TabsContent value="court">
                <CourtTracker />
              </TabsContent>
            </Permission>

            <TabsContent
              className="flex flex-col"
              value="stats"
            >
              <Permission teamSlug={event.team?.slug ?? ""}>
                <div className="ml-auto">
                  <SaveButton eventId={event.id} />
                </div>
              </Permission>

              <DataTable
                teamSlug={event.team?.slug ?? ""}
                columns={columns}
                isAdmin={isAdmin}
              />
            </TabsContent>
          </StatisticsProvider>
        </Tabs>
      ) : (
        <EventDetailsCard event={event} />
      )}
    </>
  )
}
