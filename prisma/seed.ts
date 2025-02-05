import { Prisma, PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const members: Prisma.MemberCreateInput[] = [
    { name: "Liam Anderson", email: "liam.anderson@example.com" },
    { name: "Emma Johnson", email: "emma.johnson@example.com" },
    { name: "Noah Williams", email: "noah.williams@example.com" },
    { name: "Olivia Brown", email: "olivia.brown@example.com" },
    { name: "William Garcia", email: "william.garcia@example.com" },
    { name: "Sophia Martinez", email: "sophia.martinez@example.com" },
    { name: "James Rodriguez", email: "james.rodriguez@example.com" },
    { name: "Ava Davis", email: "ava.davis@example.com" },
    { name: "Benjamin Wilson", email: "benjamin.wilson@example.com" },
    { name: "Mia Lopez", email: "mia.lopez@example.com" },
  ]

  for (const member of members) {
    await prisma.member.upsert({
      where: { email: member.email },
      update: {},
      create: member,
    })
  }

  console.log("Seed data inserted successfully")
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
