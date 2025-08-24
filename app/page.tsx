import * as React from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NoneFound } from "@/components/ui/custom/NoneFound"
import { PlusCircle, Volleyball } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateTeamDialog } from "./CreateTeamDialog"

export default async function Home() {
  const session = await getAuthSession()

  if (!session) {
    redirect("/login")
  }

  const usersLastSelectedTeamSlug = (
    await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastSelectedTeam: { select: { slug: true } } },
    })
  )?.lastSelectedTeam?.slug

  if (usersLastSelectedTeamSlug) {
    redirect(`/${usersLastSelectedTeamSlug}/events`)
  }

  const teams = await prisma.team.findMany({
    where: { members: { some: { member: { userId: session.user.id } } } },
    select: { slug: true, name: true, description: true, id: true },
    orderBy: { name: "asc" },
  })

  if (teams.length === 0) {
    return (
      <NoneFound
        title="No teams found yet."
        description="You do not have any teams yet. Start creating a team."
        icon={Volleyball}
      >
        <CreateTeamDialog>
          <Button
            variant="outline"
            aria-label="Create Team"
          >
            <PlusCircle className="h-5 w-5" />
            Create Team
          </Button>
        </CreateTeamDialog>
      </NoneFound>
    )
  }
  redirect(`/${teams[0]?.slug}/events`)
}
