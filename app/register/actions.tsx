"use server"

import bycript from "bcrypt"
import { prisma } from "@/prisma/singlePrismaClient"
import { redirect } from "next/navigation"

export const register = async (_: any, formData: FormData) => {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existingUser) {
    return { message: "User already exists" }
  }

  await prisma.user.create({
    data: {
      email,
      password: await bycript.hash(password, 10),
      username,
      firstName,
      lastName,
    },
  })

  redirect("/login")
}
