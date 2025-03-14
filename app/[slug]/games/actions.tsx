"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { revalidatePath } from "next/cache"
import slugify from "slugify"

export const createGame = async (teamSlug: string, date: Date, formData: FormData) => {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
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
      ...(participants.length
        ? {
            participants: {
              create: participants.map(id => ({ Person: { connect: { id } } })),
            },
          }
        : {}),
      Team: { connect: { slug: teamSlug } },
    },
  })

  revalidatePath("/[slug]/games", "page")
}
