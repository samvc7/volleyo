"use server"

import slugify from "slugify"
import { prisma } from "@/prisma/singlePrismaClient"
import { getAuthSession } from "@/lib/auth"

export const createTeam = async (formData: FormData) => {
  const session = await getAuthSession()

  if (!session) {
    throw new Error("User not authenticated")
  }

  const name = formData.get("name") as string

  const existingMember = await prisma.member.findFirst({
    where: { userId: session?.user.id },
  })

  if (existingMember) {
    const team = await prisma.team.create({
      data: {
        name: name,
        slug: slugify(name, { lower: true, strict: true }),
        members: {
          create: {
            roles: ["ADMIN"],
            member: {
              connect: {
                id: existingMember.id,
              },
            },
          },
        },
      },
    })

    return team
  } else {
    const team = await prisma.team.create({
      data: {
        name: name,
        slug: slugify(name, { lower: true, strict: true }),
        members: {
          create: {
            roles: ["ADMIN"],
            member: {
              create: {
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                user: {
                  connect: { id: session.user.id },
                },
              },
            },
          },
        },
      },
    })
    return team
  }
}

export const updateLastSelectedTeam = async (teamId: string, userId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  })

  if (!team) {
    throw new Error("Team not found")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastSelectedTeam: { connect: { id: team.id } } },
  })
}
