"use server"
import slugify from "slugify"
import { prisma } from "@/prisma/singlePrismaClient"

export const createTeam = async (formData: FormData) => {
  const name = formData.get("name") as string

  const team = await prisma.team.create({
    data: {
      name: name,
      slug: slugify(name, { lower: true, strict: true }),
    },
  })
  return team
}
