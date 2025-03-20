import { prisma } from "@/prisma/singlePrismaClient"
import { NewGameDialog } from "./NewGameDialog"
import { GameCard } from "./GameDayCard"
import { Game, Person } from "@prisma/client"
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
    include: {
      participants: { select: { Person: { select: { firstName: true, lastName: true, nickName: true } } } },
    },
    where: { Team: { slug }, ...(from && to ? { AND: { date: { gte: fromDate, lte: toDate } } } : {}) },
    orderBy: { date: "desc" },
  })

  const members = await prisma.person.findMany({
    where: { team: { some: { Team: { slug } } }, AND: { team: { some: { removedAt: null } } } },
    select: { id: true, firstName: true, lastName: true, nickName: true },
  })

  const today = new Date()
  const [upcomingGames, pastGames] = games.reduce<
    [GameWithFormattedParticipants[], GameWithFormattedParticipants[]]
  >(
    ([upcoming, past], game) => {
      const formattedGame = {
        ...game,
        participants: game.participants.map(p => p.Person),
      }

      if (game.date >= today) {
        upcoming.push(formattedGame)
      } else {
        past.push(formattedGame)
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
            <GameCard
              key={game.id}
              game={game}
            />
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
            <GameCard
              key={game.id}
              game={game}
            />
          ))}
        </ul>
      ) : null}
    </NewGameDialog>
  )
}

export type GameWithFormattedParticipants = Omit<Game, "participants"> & {
  participants: Pick<Person, "firstName" | "lastName" | "nickName">[]
}
