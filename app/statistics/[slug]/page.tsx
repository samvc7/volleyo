import { DataTable } from "@/app/statistics/[slug]/data-table"
import { Statistics } from "./columns"
import { columns } from "./columns"
import { prisma } from "@/prisma/singlePrismaClient"
import { GameDetailsCard } from "./GameDetailsCard"

export default async function StatisticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const game = await prisma.game.findUnique({
    where: { slug: slug },
    include: {
      statistics: {
        include: {
          person: { select: { firstName: true, lastName: true } },
        },
      },
      team: true,
    },
  })

  if (!game) {
    return <h1>Game not found</h1>
  }

  const statistics = game?.statistics.map(statistic => {
    const { person, ...statisticData } = statistic
    return {
      ...statisticData,
      name: `${person.firstName} ${person.lastName}`,
    }
  }) as Statistics[]

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <GameDetailsCard game={game} />
      <DataTable
        gameId={game.id}
        columns={columns}
        initialData={statistics}
      />
    </main>
  )
}
