import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const persons = [
    { firstName: "Caroline", lastName: "Toberman", email: "caroline.toberman@example.com" },
    { firstName: "Madison", lastName: "Maxwell", email: "madison.maxwell@example.com" },
    { firstName: "Milani", lastName: "Lee", email: "milani.lee@example.com" },
    { firstName: "Laurel", lastName: "Barsocchini", email: "laurel.barsocchini@example.com" },
    { firstName: "Victoria", lastName: "Davis", email: "victoria.davis@example.com" },
    { firstName: "Bridget", lastName: "Conley", email: "bridget.conley@example.com" },
    { firstName: "Hannah", lastName: "Shaffer", email: "hannah.shaffer@example.com" },
    { firstName: "Jaydin", lastName: "Watts", email: "jaydin.watts@example.com" },
    { firstName: "Benjamin", lastName: "Wilson", email: "benjamin.wilson@example.com" },
    { firstName: "Mia", lastName: "Lopez", email: "mia.lopez@example.com" },
  ]

  const personRecords = []
  for (const person of persons) {
    const record = await prisma.person.create({
      data: person,
    })
    personRecords.push(record)
  }

  const team = await prisma.team.create({
    data: {
      name: "Alpha Squad",
      description: "Elite volleyball team",
      slug: "alpha-squad",
      members: {
        create: personRecords.map(person => ({ personId: person.id })),
      },
    },
  })

  const games = [
    {
      title: "Game 1",
      slug: "game-1",
      description: "Season Opener",
      date: new Date(2024, 12, 11),
      teamScore: 25,
      opponentScore: 20,
    },
    {
      title: "Game 2",
      slug: "game-2",
      description: "Tough Opponent",
      date: new Date(2024, 12, 12),
      teamScore: 25,
      opponentScore: 22,
    },
    {
      title: "Game 3",
      slug: "game-3",
      description: "Mid-season Battle",
      date: new Date(2024, 12, 13),
      teamScore: 18,
      opponentScore: 25,
    },
    {
      title: "Game 4",
      slug: "game-4",
      description: "Final Showdown",
      date: new Date(2024, 12, 14),
      teamScore: 25,
      opponentScore: 20,
    },
  ]

  games.forEach(async game => {
    await prisma.game.create({
      data: {
        ...game,
        teamId: team.id,
      },
    })
  })

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
