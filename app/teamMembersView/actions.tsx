"use server"

import { prisma } from "@/prisma/singlePrismaClient"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export const createMember = async (formData: FormData) => {
  const nickName = formData.get("nickName") as string

  const data = {
    email: formData.get("email") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    ...(nickName ? { nickName } : {}),
  } satisfies Prisma.MemberCreateInput

  await prisma.member.create({
    data,
  })

  revalidatePath("/")
}
