"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export const createMember = async (teamSlug: string, formData: FormData) => {
  const nickName = formData.get("nickName") as string
  const email = formData.get("email") as string | null

  const data = {
    email: email ? email : null,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    ...(nickName ? { nickName } : {}),
    team: {
      create: {
        team: {
          connect: {
            slug: teamSlug,
          },
        },
      },
    },
  } satisfies Prisma.PersonCreateInput

  await prisma.person.create({
    data,
  })

  revalidatePath("/[slug]/members", "page")
}

export const editMember = async (id: string, formData: FormData) => {
  const nickName = formData.get("nickName") as string
  const email = formData.get("email") as string | null

  const data = {
    email: email ? email : null,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    ...(nickName ? { nickName } : {}),
  } satisfies Prisma.PersonUpdateInput

  await prisma.person.update({
    data,
    where: { id },
  })

  revalidatePath("/[slug]/members", "page")
}

export const removeMember = async (teamSlug: string, id: string) => {
  const teamId = await prisma.team.findUnique({
    where: { slug: teamSlug },
    select: { id: true },
  })
  if (!teamId) throw new Error("Team not found")

  await prisma.teamMembers.update({
    data: { removedAt: new Date() },
    where: { personId_teamId: { personId: id, teamId: teamId.id } },
  })

  revalidatePath("/[slug]/members", "page")
}
