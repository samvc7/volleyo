"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { EventType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import slugify from "slugify"

export const createEvent = async (teamSlug: string, date: Date, formData: FormData) => {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const type = formData.get("type") as EventType

  await prisma.event.create({
    data: {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      description,
      date,
      location,
      type,
      team: { connect: { slug: teamSlug } },
    },
  })

  revalidatePath("/[slug]/events", "page")
}

export const updateEvent = async (eventId: string, date: Date, formData: FormData) => {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const teamScore = formData.get("team-score") as string
  const opponentName = formData.get("opponent") as string
  const opponentScore = formData.get("opponent-score") as string
  const type = formData.get("type") as EventType

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      description,
      date,
      location,
      type,
      ...(teamScore === null ? {} : teamScore === "" ? null : { teamScore: parseInt(teamScore) }),
      ...(opponentName === null ? {} : opponentName === "" ? null : { opponentName }),
      ...(opponentScore === null
        ? {}
        : opponentScore === ""
        ? null
        : { opponentScore: parseInt(opponentScore) }),
    },
  })

  revalidatePath("statistics/[slug]", "page")
}
