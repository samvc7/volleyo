import { Member, TeamMember, TeamRole } from "@prisma/client"
import NextAuth from "next-auth"

type MemberWithTeams = Member & {
  teams: (TeamMember & {
    team: Team
  })[]
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      members: MemberWithTeams[]
      teamRoles: Record<string, TeamRole>
    }
  }
}
