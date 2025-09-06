import { UserMenu } from "./UserMenu"
import { getAuthSession } from "@/lib/auth"
import { TeamSwitcher } from "../team-switcher/TeamSwitcher"
import { prisma } from "@/prisma/singlePrismaClient"

export const SessionNav = async () => {
  const session = await getAuthSession()
  if (!session) return null

  const usersLastSelectedTeam = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastSelectedTeam: true },
  })

  const teams = await prisma.team.findMany({
    where: { members: { some: { member: { userId: session.user.id } } } },
    orderBy: { name: "asc" },
  })

  const teamMembersNotConnectedToUser = await prisma.teamMember.findMany({
    where: {
      member: { email: session.user.email, OR: [{ userId: null }, { userId: { not: session.user.id } }] },
      removedAt: null,
    },
    include: { team: true },
  })

  return (
    <div className="w-full flex items-center justify-between">
      <TeamSwitcher
        teams={teams}
        selectedTeam={usersLastSelectedTeam?.lastSelectedTeam ?? undefined}
        suggestedTeamsWithMember={teamMembersNotConnectedToUser}
      />

      <UserMenu user={session.user} />
    </div>
  )
}
