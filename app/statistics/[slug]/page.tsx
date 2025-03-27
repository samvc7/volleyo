import { DataTable } from "@/app/statistics/[slug]/data-table"
import { Statistics } from "./columns"
import { columns } from "./columns"
import { prisma } from "@/prisma/singlePrismaClient"
import { format } from "date-fns"
import { DATE_FORMAT } from "@/app/utils"

export default async function StatisticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const game = await prisma.game.findUnique({
    where: { slug: slug },
    include: {
      statistics: {
        include: {
          Person: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!game) {
    return <h1>Game not found</h1>
  }

  const statistics = game?.statistics.map(statistic => {
    const { Person, ...statisticData } = statistic
    return {
      ...statisticData,
      name: `${Person.firstName} ${Person.lastName}`,
    }
  }) as Statistics[]

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <h1 className="text-3xl font-bold">
        {game.title} - {format(game.date, DATE_FORMAT)}
      </h1>
      <DataTable
        gameId={game.id}
        columns={columns}
        initialData={statistics}
      />
    </main>
  )
}
