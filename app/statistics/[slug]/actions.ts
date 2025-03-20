"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { revalidatePath } from "next/cache"
import { Statistics } from "./columns"
import { Prisma } from "@prisma/client"

export const createNewStatistics = async (data: Statistics[], gameId: string) => {
  await Promise.all(
    data
      .filter(statistic => !statistic.name.includes("total"))
      .map(async statistic => {
        return prisma.$transaction(async tx => {
          const persons = await findPersons(statistic.name)

          const { id, name, ...statisticPrismaPayload } = statistic

          await tx.statistics.upsert({
            where: { id },
            update: statisticPrismaPayload,
            create: {
              ...statisticPrismaPayload,
              personId: persons[0].id,
              gameId,
            },
          })
        })
      }),
  )

  revalidatePath("/statistics/[slug]", "page")
}

const findPersons = async (name: string) => {
  const names = name.split(" ")

  const firstNamesQuery = names.slice(0, names.length - 1).map(name => {
    return { firstName: { contains: name } } as Prisma.PersonWhereInput
  })

  const persons = await prisma.person.findMany({
    where: { lastName: names[names.length - 1], AND: [...firstNamesQuery] },
  })

  if (!persons || persons.length === 0) {
    throw new Error(`Person not found: ${name}`)
  }

  if (persons.length > 1) {
    throw new Error(`Multiple persons found: ${name}`)
  }

  return persons
}
