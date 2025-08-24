"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { getAuthSession } from "@/lib/auth"

export const getTeamSlug = async () => {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("User not authenticated")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastSelectedTeam: { select: { slug: true } } },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const teamSlug = await prisma.team.findUnique({
    where: { id: user.lastSelectedTeam?.slug ?? "" },
    select: { slug: true },
  })

  return teamSlug?.slug
}
