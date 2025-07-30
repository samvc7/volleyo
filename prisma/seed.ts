import bycript from "bcryptjs"
import { Member, PrismaClient } from "@prisma/client"
import { adminMember, events, attendees, guestMember, members } from "./seedData"

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

      const admin = await tx.member.create({
        data: adminMember,
      })
      memberRecords.push(admin)

      const guest = await tx.member.create({
        data: guestMember,
      })
      memberRecords.push(guest)

      await tx.user.create({
        data: {
          email: adminMember.email,
          firstName: adminMember.firstName,
          lastName: adminMember.lastName,
          password: await bycript.hash("admin123", 10),
          members: {
            connect: { id: admin.id },
          },
        },
      })

      await tx.user.create({
        data: {
          email: guestMember.email,
          firstName: guestMember.firstName,
          lastName: guestMember.lastName,
          password: await bycript.hash("guest123", 10),
          members: {
            connect: { id: guest.id },
          },
        },
      })

      const team = await tx.team.create({
        data: {
          name: "Alpha Squad",
          description: "Elite volleyball team",
          slug: "alpha-squad",
          members: {
            create: memberRecords.map(member => ({
              memberId: member.id,
              roles: member.email === "admin@example.com" ? ["ADMIN"] : ["MEMBER"],
            })),
          },
        },
      })

      for (const event of events) {
        await tx.event.create({
          data: {
            ...event,
            team: { connect: { id: team.id } },
          },
        })
      }

      for (let i = 0; i < attendees.length; i++) {
        const event = events[i]
        const attendeeData = attendees[i]

        for (const data of attendeeData) {
          const member = memberRecords.find(m => m.firstName === data.attendee.name.split(" ")[0])

          if (!member) {
            console.warn(`Member not found for name: ${data.attendee.name}`)
            continue
          }

          await tx.attendee.create({
            data: {
              event: { connect: { slug: event.slug } },
              member: { connect: { id: member.id } },
              statistics: {
                create: data.statistics,
              },
            },
          })
        }
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
