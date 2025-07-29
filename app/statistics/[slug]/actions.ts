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
          const { id, name, attendeeId, ...statisticPrismaPayload } = statistic

          if (deleteCurrentStatistics) {
            await tx.statistics.deleteMany({ where: { attendee: { gameId: gameIdFallback } } })
          }

          const existingStat = await tx.statistics.findFirst({
            where: { attendeeId },
          })

          if (!existingStat) {
            await tx.statistics.create({
              data: {
                ...statisticPrismaPayload,
                attendeeId,
              },
            })
          } else {
            await tx.statistics.update({
              where: { id: existingStat.id },
              data: {
                ...statisticPrismaPayload,
                attendeeId,
              },
            })
          }
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

  await prisma.attendee.create({
    data: {
      gameId,
      memberId,
      positions,
    },
  })

  revalidatePath("/statistics/[slug]", "page")
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
