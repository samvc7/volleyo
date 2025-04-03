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
      Team: { connect: { slug: teamSlug } },
    },
  })

  revalidatePath("/[slug]/games", "page")
}

export const updateGame = async (gameId: string, date: Date, formData: FormData) => {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string

  await prisma.game.update({
    where: { id: gameId },
    data: {
      title,
      description,
      date,
      location,
    },
  })

  revalidatePath("statistics/[slug]", "page")
}
