import { prisma } from "./singlePrismaClient"

async function resetDevData() {
  console.log("🔄 Resetting dev-only data...")

  await prisma.statistics.deleteMany({
    where: {
      attendee: {
        OR: [{ member: { user: { isDev: true } } }, { event: { team: { isDev: true } } }],
      },
    },
  })

  await prisma.attendee.deleteMany({
    where: {
      OR: [{ member: { user: { isDev: true } } }, { event: { team: { isDev: true } } }],
    },
  })

  await prisma.event.deleteMany({
    where: { team: { isDev: true } },
  })

  await prisma.teamMember.deleteMany({
    where: { member: { isDev: true } },
  })

  await prisma.member.deleteMany({
    where: { isDev: true },
  })

  await prisma.account.deleteMany({
    where: { user: { isDev: true } },
  })

  await prisma.user.deleteMany({ where: { isDev: true } })

  await prisma.team.deleteMany({ where: { isDev: true } })

  console.log("✅ Dev data reset complete.")
}

resetDevData()
  .catch(err => {
    console.error("❌ Error during dev data reset:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
