import { AddMembersDialog } from "../AddMembersDialog"
import { Prisma } from "@prisma/client"
import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/prisma/singlePrismaClient"

type AddMembersProps = {
  event: Prisma.EventGetPayload<{
    include: {
      team?: true
    }
  }>
}

export const AddMembers = async ({ event }: AddMembersProps) => {
  const session = await getAuthSession()

  const isAdmin = session?.user.teamRoles[event.team?.slug || ""] === "ADMIN"
  const teamsOfAdmin = isAdmin
    ? Object.keys(session?.user.teamRoles).filter(teamSlug => teamSlug !== event.team?.slug)
    : []

  const membersNotParticipating = await prisma.member.findMany({
    where: {
      teams: { some: { team: { slug: event.team?.slug }, removedAt: null } },
      attendees: { none: { eventId: event.id } },
    },
  })

  const otherTeamMembersAndNotParticipating = await prisma.member.findMany({
    where: {
      teams: { some: { team: { slug: { in: teamsOfAdmin } }, removedAt: null } },
      attendees: { none: { eventId: event.id } },
    },
  })

  return (
    <div className="flex gap-1 ml-auto">
      <AddMembersDialog
        event={event}
        membersNotParticipating={membersNotParticipating}
        otherTeamMembers={otherTeamMembersAndNotParticipating}
        disabled={membersNotParticipating.length === 0 && otherTeamMembersAndNotParticipating.length === 0}
      />
    </div>
  )
}
