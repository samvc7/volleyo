import * as React from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { TeamSwitcher } from "./team-switcher/TeamSwitcher"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getAuthSession()

  if (!session) {
    redirect("/login")
  }

  const usersLastSelectedTeamSlug = (
    await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastSelectedTeam: { select: { slug: true } } },
    })
  )?.lastSelectedTeam?.slug

  if (usersLastSelectedTeamSlug) {
    redirect(`/${usersLastSelectedTeamSlug}/events`)
  }

  const teams = await prisma.team.findMany({
    where: { members: { some: { member: { userId: session.user.id } } } },
    select: { slug: true, name: true, description: true, id: true },
    orderBy: { name: "asc" },
  })

  if (teams.length === 0) {
    // TODO: No teams found -> implement and show create team card with button
    return (
      <TeamSwitcher
        teams={teams}
        selectedTeam={teams[0]}
      />
    )
  }
  redirect(`/${teams[0]?.slug}/events`)
}
