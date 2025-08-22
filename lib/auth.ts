import { PrismaAdapter } from "@next-auth/prisma-adapter"

import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google"
// import FacebookProvider from "next-auth/providers/facebook"
import NextAuth, { AuthOptions, getServerSession } from "next-auth"
import { compare } from "bcryptjs"
import { prisma } from "@/prisma/singlePrismaClient"
import { TeamRole } from "@prisma/client"

// 2 days in seconds
const MAX_SESSION_AGE = 60 * 60 * 24 * 2

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
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.token) {
          return authenticateWithToken(credentials.token)
        }

        return authenticateWithCredentials(credentials?.identifier, credentials?.password)
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: MAX_SESSION_AGE },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { members: { include: { teams: { include: { team: true } } } } },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.members = dbUser.members

          const teamRoles: Record<string, TeamRole> = {}

          dbUser?.members.forEach(member => {
            member.teams.forEach(teamMember => {
              teamRoles[teamMember.team.slug] = teamMember.roles.includes("ADMIN")
                ? TeamRole.ADMIN
                : TeamRole.MEMBER
            })
          })

          session.user.teamRoles = teamRoles
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

const authenticateWithToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { authToken: { token } },
  })

  return user
}

const authenticateWithCredentials = async (identifier?: string, password?: string) => {
  if (!identifier || !password) return null

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  })

  if (!user || !user.password) return null

  const isValid = await compare(password, user.password)
  return isValid ? user : null
}
