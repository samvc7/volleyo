import { prisma } from "@/prisma/singlePrismaClient"
import { GameDetailsCard } from "../[slug]/GameDetailsCard"

type InvitePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { game, token } = await searchParams

  const gameToInvite = await prisma.game.findUnique({
    where: { id: game as string },
    include: {
      statistics: { include: { member: true } },
      team: { include: { members: { include: { member: true } } } },
    },
  })

  if (!gameToInvite) {
    return <h1 className="text-center text-2xl font-bold">Game not found</h1>
  }

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold">
        You were invited to {gameToInvite.title}
      </h1>
      <GameDetailsCard
        game={gameToInvite}
        enableCollapse
        enableInvitationResponse
      />
    </main>
  )
}
