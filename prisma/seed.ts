import { Person, PrismaClient } from "@prisma/client"
import { games, gameStatistics, persons } from "./seedData"

const prisma = new PrismaClient()
async function main() {
  const personRecords: Person[] = []
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

  games.forEach(async (game, ix) => {
    await prisma.game.create({
      data: {
        ...game,
        teamId: team.id,
        statistics: {
          create: gameStatistics[ix].map(statistic => {
            const { name, ...stats } = statistic

            return {
              ...stats,
              person: {
                connect: {
                  id: personRecords.find(person => person.firstName === statistic.name.split(" ")[0])?.id,
                },
              },
            }
          }),
        },
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
