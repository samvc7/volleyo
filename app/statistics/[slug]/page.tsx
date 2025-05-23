import { DataTable } from "@/app/statistics/[slug]/data-table"
import { Statistics } from "./columns"
import { columns } from "./columns"
import { prisma } from "@/prisma/singlePrismaClient"
import { GameDetailsCard } from "./GameDetailsCard"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import CourtTracker from "./_court-tracker/CourtTracker"
import { StatisticsProvider } from "./StatisticsProvider"
import { SaveButton } from "./Savebutton"

export default async function StatisticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getAuthSession()
  if (!session) {
    redirect("/login")
  }

  const slug = (await params).slug
  const game = await prisma.game.findUnique({
    where: { slug: slug },
    include: {
      statistics: {
        include: {
          member: { select: { firstName: true, lastName: true } },
        },
      },
      team: true,
    },
  })

  if (!game) {
    return <h1>Game not found</h1>
  }

  const isMember = session.user.members.some(member => member.teams.some(team => team.teamId === game.teamId))
  if (!isMember) {
    redirect("/forbidden")
  }

  const statistics = game?.statistics.map(statistic => {
    const { member, ...statisticData } = statistic
    return {
      ...statisticData,
      name: `${member.firstName} ${member.lastName}`,
    }
  }) as Statistics[]

  const membersNotParticipating = await prisma.member.findMany({
    where: {
      teams: { some: { team: { slug: game.team?.slug }, removedAt: null } },
      statistics: { none: { gameId: game.id } },
    },
  })

  const isAdmin = session.user.teamRoles[game.team?.slug ?? ""] === "ADMIN"

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <GameDetailsCard game={game} />
      <Tabs defaultValue="stats">
        <StatisticsProvider initialData={statistics}>
          <div className="flex">
            <TabsList>
              <TabsTrigger value={"court"}>Court</TabsTrigger>
              <TabsTrigger value={"stats"}>Statistics</TabsTrigger>
            </TabsList>
            <div className="ml-auto">
              <SaveButton gameId={game.id} />
            </div>
          </div>

          <TabsContent value="court">
            <CourtTracker />
          </TabsContent>

          <TabsContent value="stats">
            <DataTable
              gameId={game.id}
              teamSlug={game.team?.slug ?? ""}
              membersNotParticipating={membersNotParticipating}
              columns={columns}
              isAdmin={isAdmin}
            />
          </TabsContent>
        </StatisticsProvider>
      </Tabs>
    </main>
  )
}
