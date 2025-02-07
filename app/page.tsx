import * as React from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { TeamSwitcher } from "./team-switcher/TeamSwitcher"

export default async function Home() {
  const teams = await prisma.team.findMany({
    select: { slug: true, name: true, description: true, id: true },
  })

  if (teams.length === 0) {
    return <h1>No teams found.</h1>
  }

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <TeamSwitcher
        teams={teams}
        selectedTeam={teams[0]}
      />
    </main>
  )
}
