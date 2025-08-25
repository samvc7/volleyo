import { prisma } from "@/prisma/singlePrismaClient"
import { columns, DataTable } from "./data-table"
import { Users } from "lucide-react"
import { AddTeamMemberDialog } from "./dialogs"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NoneFound } from "@/components/ui/custom/NoneFound"
import { Permission } from "@/components/ui/custom/Permission"

export default async function TeamMembersView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getAuthSession()
  if (session?.user.teamRoles[slug] !== "ADMIN") return redirect("/forbidden")

  const teamMembers = await prisma.member.findMany({
    where: { teams: { some: { team: { slug } } }, AND: { teams: { some: { removedAt: null } } } },
  })

  if (teamMembers.length === 0) {
    return (
      <NoneFound
        title="No members yet."
        description="There are no members in this team yet. Start adding members to your team."
        icon={Users}
      >
        <Permission teamSlug={slug}>
          <AddTeamMemberDialog />
        </Permission>
      </NoneFound>
    )
  }

  return (
    <section>
      <DataTable
        columns={columns}
        data={teamMembers}
      />
    </section>
  )
}
