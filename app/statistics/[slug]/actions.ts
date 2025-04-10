"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { revalidatePath } from "next/cache"
import { Statistics } from "./columns"
import { Position, Prisma } from "@prisma/client"

export const saveStatistics = async (
  data: Statistics[],
  gameIdFallback: string,
  deleteCurrentStatistics?: boolean,
) => {
  await Promise.all(
    data
      .filter(statistic => !statistic.name.includes("total"))
      .map(async statistic => {
        return prisma.$transaction(async tx => {
          const { id, name, personId, gameId, ...statisticPrismaPayload } = statistic

          const correctPersonId = personId ?? (await getPersonId(statistic))
          const correctGameId = gameId ?? gameIdFallback

          if (deleteCurrentStatistics) await tx.statistics.deleteMany({ where: { gameId: correctGameId } })

          await tx.statistics.upsert({
            where: { personId_gameId: { personId: correctPersonId, gameId: correctGameId } },
            update: {
              ...statisticPrismaPayload,
              personId: correctPersonId,
              gameId: correctGameId,
            },
            create: {
              ...statisticPrismaPayload,
              personId: correctPersonId,
              gameId: correctGameId,
            },
          })
        })
      }),
  )

  revalidatePath("/statistics/[slug]", "page")
}

export const addPlayer = async (gameId: string, formData: FormData) => {
  const personId = formData.get("member") as string
  const positions = (formData
    .get("positions")
    ?.toString()
    .split(",")
    .filter(p => p.trim().length) || []) as Position[]

  await prisma.statistics.create({
    data: {
      personId,
      gameId,
      positions,
    },
  })

  revalidatePath("/statistics/[slug]", "page")
}

const getPersonId = async (statistic: Statistics) => {
  if (statistic.personId) return statistic.personId

  const names = statistic.name.split(" ")

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

  return persons[0].id
}
