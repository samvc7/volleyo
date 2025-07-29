import { prisma } from "@/prisma/singlePrismaClient"
import { NewGameDialog } from "./NewGameDialog"
import { GameCardLink } from "./GameCard"
import { Prisma } from "@prisma/client"
import { Separator } from "@/components/ui/separator"
import { Volleyball } from "lucide-react"
import { Permission } from "@/components/ui/custom/Permission"

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
    include: { attendees: { include: { statistics: true } }, team: true },
    where: { team: { slug }, ...(from && to ? { AND: { date: { gte: fromDate, lte: toDate } } } : {}) },
    orderBy: { date: "desc" },
  })

  const today = new Date()
  const [upcomingGames, pastGames] = games.reduce<[GameWithRelations[], GameWithRelations[]]>(
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
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
        <div className="mb-4 rounded-full bg-muted p-6">
          {<Volleyball className="h-12 w-12 text-muted-foreground" />}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">No games yet.</h2>
        <p className="text-muted-foreground max-w-md mt-2 mb-6">
          {`You haven't added any games yet. Start planning your games and document statistics by adding new
          games.`}
        </p>
        <Permission teamSlug={slug}>
          <NewGameDialog />
        </Permission>
      </div>
    )
  }

  return (
    <>
      <Permission teamSlug={slug}>
        <NewGameDialog triggerClassName="ml-auto" />
      </Permission>
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
    </>
  )
}

export type GameWithRelations = Prisma.GameGetPayload<{
  include: { attendees: { include: { statistics: true } }; team?: true }
}>
