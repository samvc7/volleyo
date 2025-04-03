"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { revalidatePath } from "next/cache"
import slugify from "slugify"

export const createGame = async (teamSlug: string, date: Date, formData: FormData) => {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const participants =
    formData
      .get("participants")
      ?.toString()
      .split(",")
      .filter(p => p.trim().length) || []

  await prisma.game.create({
    data: {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      description,
      date,
      location,
      ...(participants.length
        ? {
            statistics: {
              create: participants.map(id => ({ personId: id })),
            },
          }
        : {}),
      team: { connect: { slug: teamSlug } },
    },
  })

  revalidatePath("/[slug]/games", "page")
}

export const updateGame = async (gameId: string, date: Date, formData: FormData) => {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const teamScore = formData.get("team-score") as string
  const opponentName = formData.get("opponent") as string
  const opponentScore = formData.get("opponent-score") as string

  await prisma.game.update({
    where: { id: gameId },
    data: {
      title,
      description,
      date,
      location,
      teamScore: teamScore ? parseInt(teamScore) : null,
      opponentName,
      opponentScore: opponentScore ? parseInt(opponentScore) : null,
    },
  })

  revalidatePath("statistics/[slug]", "page")
}
