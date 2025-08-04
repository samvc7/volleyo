"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { revalidatePath } from "next/cache"
import { Statistics } from "./columns"
import { Position } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { add } from "date-fns"

export const saveStatistics = async (
  data: Statistics[],
  eventIdFallback: string,
  deleteCurrentStatistics?: boolean,
) => {
  await Promise.all(
    data
      .filter(statistic => !statistic.name.includes("total"))
      .map(async statistic => {
        return prisma.$transaction(async tx => {
          const { id, name, attendeeId, ...statisticPrismaPayload } = statistic

          if (deleteCurrentStatistics) {
            await tx.statistics.deleteMany({ where: { attendee: { eventId: eventIdFallback } } })
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

export const addNotAttendeeMembers = async (eventId: string, formData: FormData) => {
  const memberIds =
    formData
      .get("members")
      ?.toString()
      .split(",")
      .filter(m => m.trim().length) || []

  const otherMemberIds =
    formData
      .get("other-team-members")
      ?.toString()
      .split(",")
      .filter(om => om.trim().length) || []

  await prisma.attendee.createMany({
    data: memberIds.map(memberId => ({
      eventId,
      memberId,
    })),
  })

  await prisma.attendee.createMany({
    data: otherMemberIds.map(memberId => ({
      eventId,
      memberId,
    })),
  })

  revalidatePath("/statistics/[slug]", "page")
}

export const addTeamsNotParticipating = async (eventId: string, formData: FormData) => {
  const teamsId = (formData
    .get("teams")
    ?.toString()
    .split(",")
    .filter(t => t.trim().length) || []) as string[]

  await Promise.all(
    teamsId.map(async teamId => {
      prisma.team.update({
        where: { id: teamId },
        data: { events: { connect: { id: eventId } } },
      })
    }),
  )

  revalidatePath("/statistics/[slug]", "page")
}

export const isFromOtherTeam = async (attendeeId: string, teamId: string) => {
  const memberInTeam = await prisma.teamMember.findFirst({
    where: {
      memberId: {
        equals: (
          await prisma.attendee.findUnique({
            where: { id: attendeeId },
            select: { memberId: true },
          })
        )?.memberId,
      },
      teamId: teamId,
    },
  })

  return !memberInTeam
}

export const getAuthToken = async (eventSlug: string) => {
  const guestMember = await prisma.member.findFirst({
    where: {
      firstName: "Guest",
      teams: { some: { team: { events: { some: { slug: eventSlug } } } } },
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

export const acceptInvitation = async (attendeeId: string) => {
  await prisma.attendee.update({
    where: { id: attendeeId },
    data: {
      status: "ACCEPTED",
    },
  })

  revalidatePath("/statistics/[slug]", "page")
}

export const declineInvitation = async (attendeeId: string) => {
  await prisma.attendee.update({
    where: { id: attendeeId },
    data: {
      status: "DECLINED",
    },
  })

  revalidatePath("/statistics/[slug]", "page")
}

export const updateAttendeePositions = async (attendeeId: string, formData: FormData) => {
  const positions = formData
    .get("positions")
    ?.toString()
    .split(",")
    .filter(p => p.trim().length) as Position[]

  await prisma.attendee.update({
    where: { id: attendeeId },
    data: {
      positions,
    },
  })
  revalidatePath("/statistics/[slug]", "page")
}
