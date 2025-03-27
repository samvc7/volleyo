import { prisma } from "@/prisma/singlePrismaClient"
import { NewGameDialog } from "./NewGameDialog"
import { GameCardLink } from "./GameDayCard"
import { Prisma } from "@prisma/client"
import { Separator } from "@/components/ui/separator"

export default async function GamesView({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { from, to } = await searchParams
  const fromDate = new Date(from as string)
  const toDate = new Date(to as string)

  const games = await prisma.game.findMany({
    include: { statistics: true },
    where: { Team: { slug }, ...(from && to ? { AND: { date: { gte: fromDate, lte: toDate } } } : {}) },
    orderBy: { date: "desc" },
  })

  const members = await prisma.person.findMany({
    where: { team: { some: { Team: { slug } } }, AND: { team: { some: { removedAt: null } } } },
    select: { id: true, firstName: true, lastName: true, nickName: true },
  })

  const today = new Date()
  const [upcomingGames, pastGames] = games.reduce<[GameWithStatistic[], GameWithStatistic[]]>(
    ([upcoming, past], game) => {
      if (game.date >= today) {
        upcoming.push(game)
      } else {
        past.push(game)
      }

      return [upcoming, past]
    },
    [[], []],
  )

  if (!games.length) {
    return <h1>No Games yet.</h1>
  }

  return (
    <NewGameDialog participants={members}>
      {upcomingGames.length ? (
        <ul className="w-full flex flex-col gap-4 mt-4 mb-4">
          {upcomingGames.map(game => (
            <li key={game.id}>
              <GameCardLink game={game} />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center w-full gap-4">
        <Separator allowShrink />
        <span className="px-4 whitespace-nowrap text-muted-foreground text-sm">Past Games</span>
        <Separator allowShrink />
      </div>

      {pastGames.length ? (
        <ul className="w-full flex flex-col gap-4 mt-4">
          {pastGames.map(game => (
            <li key={game.id}>
              <GameCardLink game={game} />
            </li>
          ))}
        </ul>
      ) : null}
    </NewGameDialog>
  )
}

export type GameWithStatistic = Prisma.GameGetPayload<{ include: { statistics: true } }>
