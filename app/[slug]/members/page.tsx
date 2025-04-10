import { prisma } from "@/prisma/singlePrismaClient"
import { columns, DataTable } from "./data-table"
import { Users } from "lucide-react"
import { AddTeamMemberDialog } from "./dialogs"

export default async function TeamMembersView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const teamMembers = await prisma.person.findMany({
    where: { team: { some: { team: { slug } } }, AND: { team: { some: { removedAt: null } } } },
  })

  if (teamMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
        <div className="mb-4 rounded-full bg-muted p-6">
          {<Users className="h-12 w-12 text-muted-foreground" />}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">No members yet.</h2>
        <p className="text-muted-foreground max-w-md mt-2 mb-6">
          There are no members in this team yet. Start adding members to your team by clicking the button
          below.
        </p>
        <AddTeamMemberDialog />
      </div>
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
