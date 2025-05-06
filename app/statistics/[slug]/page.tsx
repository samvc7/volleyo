import { DataTable } from "@/app/statistics/[slug]/data-table"
import { Statistics } from "./columns"
import { columns } from "./columns"
import { prisma } from "@/prisma/singlePrismaClient"
import { GameDetailsCard } from "./GameDetailsCard"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

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
      <DataTable
        gameId={game.id}
        teamSlug={game.team?.slug ?? ""}
        membersNotParticipating={membersNotParticipating}
        columns={columns}
        isAdmin={isAdmin}
        initialData={statistics}
      />
    </main>
  )
}
