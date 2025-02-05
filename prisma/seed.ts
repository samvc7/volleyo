import { Prisma, PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const members = [
    { firstName: "Liam", lastName: "Anderson", email: "liam.anderson@example.com" },
    { firstName: "Emma", lastName: "Johnson", email: "emma.johnson@example.com" },
    { firstName: "Noah", lastName: "Williams", email: "noah.williams@example.com" },
    { firstName: "Olivia", lastName: "Brown", email: "olivia.brown@example.com" },
    { firstName: "William", lastName: "Garcia", email: "william.garcia@example.com" },
    { firstName: "Sophia", lastName: "Martinez", email: "sophia.martinez@example.com" },
    { firstName: "James", lastName: "Rodriguez", email: "james.rodriguez@example.com" },
    { firstName: "Ava", lastName: "Davis", email: "ava.davis@example.com" },
    { firstName: "Benjamin", lastName: "Wilson", email: "benjamin.wilson@example.com" },
    { firstName: "Mia", lastName: "Lopez", email: "mia.lopez@example.com" },
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
