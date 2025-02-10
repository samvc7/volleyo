import { prisma } from "@/prisma/singlePrismaClient"
import { NewGameDialog } from "./NewGameDialog"
import { GameCard } from "./GameDayCard"
export default async function GamesView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const games = await prisma.game.findMany({
    include: {
      participants: { select: { Person: { select: { firstName: true, lastName: true, nickName: true } } } },
    },
    where: { Team: { slug } },
    orderBy: { date: "desc" },
  })

  const formattedGames = games.map(game => ({
    ...game,
    participants: game.participants.map(p => p.Person),
  }))

  const members = await prisma.person.findMany({
    where: { team: { some: { Team: { slug } } } },
    select: { id: true, firstName: true, lastName: true, nickName: true },
  })

  return (
    <NewGameDialog participants={members}>
      <ul className="w-full flex flex-col gap-4 mt-4">
        {formattedGames.map(game => (
          <GameCard
            id={game.id}
            key={game.id}
            title={game.title}
            date={game.date}
            description={game.description}
            participants={game.participants}
          />
        ))}
      </ul>
    </NewGameDialog>
  )
}
