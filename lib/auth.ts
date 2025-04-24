import { PrismaAdapter } from "@next-auth/prisma-adapter"

import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google"
// import FacebookProvider from "next-auth/providers/facebook"
import NextAuth, { AuthOptions, getServerSession } from "next-auth"
import { compare } from "bcrypt"
import { prisma } from "@/prisma/singlePrismaClient"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.identifier }, { username: credentials.identifier }],
          },
        })

        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        return isValid ? user : null
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub } })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

export default NextAuth(authOptions)

export const getAuthSession = () => {
  return getServerSession(authOptions)
}
