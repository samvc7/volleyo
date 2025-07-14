"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { revalidatePath } from "next/cache"
import { Statistics } from "./columns"
import { Position, Prisma } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { add } from "date-fns"

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
          const { id, name, memberId, gameId, ...statisticPrismaPayload } = statistic

          const correctmemberId = memberId ?? (await getMemberId(statistic))
          const correctGameId = gameId ?? gameIdFallback

          if (deleteCurrentStatistics) await tx.statistics.deleteMany({ where: { gameId: correctGameId } })

          await tx.statistics.upsert({
            where: { memberId_gameId: { memberId: correctmemberId, gameId: correctGameId } },
            update: {
              ...statisticPrismaPayload,
              memberId: correctmemberId,
              gameId: correctGameId,
            },
            create: {
              ...statisticPrismaPayload,
              memberId: correctmemberId,
              gameId: correctGameId,
            },
          })
        })
      }),
  )

  revalidatePath("/statistics/[slug]", "page")
}

export const deleteStatistics = async (statisticIds: string[]) => {
  await prisma.statistics.deleteMany({
    where: { id: { in: statisticIds } },
  })

  revalidatePath("/statistics/[slug]", "page")
}

export const addPlayer = async (gameId: string, formData: FormData) => {
  const memberId = formData.get("member") as string
  const positions = (formData
    .get("positions")
    ?.toString()
    .split(",")
    .filter(p => p.trim().length) || []) as Position[]

  await prisma.statistics.create({
    data: {
      memberId,
      gameId,
      positions,
    },
  })

  revalidatePath("/statistics/[slug]", "page")
}

const getMemberId = async (statistic: Statistics) => {
  if (statistic.memberId) return statistic.memberId

  const names = statistic.name.split(" ")

  const firstNamesQuery = names.slice(0, names.length - 1).map(name => {
    return { firstName: { contains: name } } as Prisma.MemberWhereInput
  })

  const members = await prisma.member.findMany({
    where: { lastName: names[names.length - 1], AND: [...firstNamesQuery] },
  })

  if (!members || members.length === 0) {
    throw new Error(`Member not found: ${name}`)
  }

  if (members.length > 1) {
    throw new Error(`Multiple members found: ${name}`)
  }

  return members[0].id
}

export const getAuthToken = async (gameId: string) => {
  const guestMember = await prisma.member.findFirst({
    where: {
      firstName: "Guest",
      teams: { some: { team: { games: { some: { id: gameId } } } } },
    },
    include: { user: { include: { authToken: true } } },
  })

  if (!guestMember?.userId || !guestMember.user) {
    throw new Error("Guest member not found.")
  }

  const existingToken = guestMember.user.authToken

  if (existingToken && existingToken.expiresAt > new Date()) {
    return existingToken
  }

  const newToken = await prisma.authToken.create({
    data: {
      userId: guestMember.userId,
      token: uuidv4(),
      expiresAt: add(new Date(), { months: 1 }),
    },
  })

  return newToken
}
