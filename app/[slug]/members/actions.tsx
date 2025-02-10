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
        Team: {
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
