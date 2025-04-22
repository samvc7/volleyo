import bycript from "bcrypt"
import { Member, PrismaClient } from "@prisma/client"
import { games, gameStatistics, members } from "./seedData"

const prisma = new PrismaClient()
async function main() {
  await prisma.$transaction(
    async tx => {
      const memberRecords: Member[] = []
      for (const member of members) {
        const record = await tx.member.create({
          data: member,
        })
        memberRecords.push(record)
      }

      await tx.user.create({
        data: {
          email: "admin@example.com",
          password: await bycript.hash("admin123", 10),
          member: {
            connect: { id: memberRecords[memberRecords.length - 1].id },
          },
        },
      })

      const team = await tx.team.create({
        data: {
          name: "Alpha Squad",
          description: "Elite volleyball team",
          slug: "alpha-squad",
          members: {
            create: memberRecords.map(member => ({ memberId: member.id })),
          },
        },
      })

      for (let ix = 0; ix < games.length; ix++) {
        const game = games[ix]
        const stats = gameStatistics[ix]
        await tx.game.create({
          data: {
            ...game,
            teamId: team.id,
            statistics: stats
              ? {
                  create: gameStatistics[ix].map(statistic => {
                    const { name, ...stats } = statistic

                    return {
                      ...stats,
                      member: {
                        connect: {
                          id: memberRecords.find(member => member.firstName === statistic.name.split(" ")[0])
                            ?.id,
                        },
                      },
                    }
                  }),
                }
              : undefined,
          },
        })
      }

      console.log("Seed data inserted successfully")
    },
    { timeout: 15000 },
  )
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
