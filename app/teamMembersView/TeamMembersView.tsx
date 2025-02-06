import { prisma } from "@/prisma/singlePrismaClient"
import { columns, DataTable } from "./data-table"
import { Person } from "@prisma/client"

export const TeamMembersView = async () => {
  const teamMembers: Person[] = await prisma.person.findMany()

  return (
    <section>
      <DataTable
        columns={columns}
        data={teamMembers}
      />
    </section>
  )
}
