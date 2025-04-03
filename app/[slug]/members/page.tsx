import { prisma } from "@/prisma/singlePrismaClient"
import { columns, DataTable } from "./data-table"

export default async function TeamMembersView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const teamMembers = await prisma.person.findMany({
    where: { team: { some: { team: { slug } } }, AND: { team: { some: { removedAt: null } } } },
  })

  return (
    <section>
      <DataTable
        columns={columns}
        data={teamMembers}
      />
    </section>
  )
}
