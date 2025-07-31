import { DataTable } from "@/app/statistics/[slug]/data-table"
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
import { AddMemberDialog } from "./AddMemberDialog"
import { Permission } from "@/components/ui/custom/Permission"
import { isEventCompetitive } from "../util"

export default async function StatisticsPage({ params }: { params: Promise<{ slug: string }> }) {
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
          member: { select: { firstName: true, lastName: true } },
          statistics: true,
        },
      },
      team: true,
    },
  })

  if (!event) {
    return <h1>Event not found</h1>
  }

  const isMember = session.user.members.some(member =>
    member.teams.some(team => team.teamId === event.teamId),
  )
  if (!isMember) {
    redirect("/forbidden")
  }

  const statistics = event?.attendees.map(attendee => {
    const { member, ...statisticData } = attendee
    return {
      ...statisticData,
      name: `${member.firstName} ${member.lastName}`,
      attendeeId: attendee.id,
    }
  }) as Statistics[]

  const membersNotParticipating = await prisma.member.findMany({
    where: {
      teams: { some: { team: { slug: event.team?.slug }, removedAt: null } },
      attendees: { none: { eventId: event.id } },
    },
  })

  const isAdmin = session.user.teamRoles[event.team?.slug ?? ""] === "ADMIN"

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <EventDetailsCard event={event} />
      {isEventCompetitive(event.type) && (
        <Tabs defaultValue="stats">
          <StatisticsProvider
            initialData={statistics}
            eventSlug={event.slug}
          >
            <div className="flex gap-4">
              <TabsList className="w-full gap-4">
                {isEventCompetitive(event.type) && (
                  <>
                    <TabsTrigger
                      className="w-full"
                      value={"court"}
                    >
                      Court
                    </TabsTrigger>
                    <TabsTrigger
                      className="w-full"
                      value={"stats"}
                    >
                      Statistics
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
              <Permission teamSlug={event.team?.slug ?? ""}>
                <div className="ml-auto">
                  <SaveButton eventId={event.id} />
                  <AddMemberDialog
                    eventId={event.id}
                    membersNotParticipating={membersNotParticipating}
                    disabled={membersNotParticipating.length === 0}
                  />
                </div>
              </Permission>
            </div>

            <TabsContent value="court">
              <CourtTracker />
            </TabsContent>

            <TabsContent value="stats">
              <DataTable
                teamSlug={event.team?.slug ?? ""}
                columns={columns}
                isAdmin={isAdmin}
              />
            </TabsContent>
          </StatisticsProvider>
        </Tabs>
      )}
    </main>
  )
}
