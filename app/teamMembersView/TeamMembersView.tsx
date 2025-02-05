import { prisma } from "@/prisma/singlePrismaClient"
import { columns, DataTable } from "./data-table"
import { Member } from "@prisma/client"

export const TeamMembersView = async () => {
  const teamMembers: Member[] = await prisma.member.findMany()

  return (
    <section>
      <DataTable
        columns={columns}
        data={teamMembers}
      />
    </section>
  )
}
