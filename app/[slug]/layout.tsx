import { ReactNode } from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { DatePickerWithRange } from "../DateRangePicker"
import { TeamSwitcher } from "../team-switcher/TeamSwitcher"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { OverviewLink } from "./navigations/OverviewLink"
import { GamesLink } from "./navigations/GamesLink"
import { MembersLink } from "./navigations/MembersLink"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Permission } from "@/components/ui/custom/Permission"

export default async function Layout({
  params,
  children,
}: Readonly<{ params: Promise<{ slug: string }>; children: ReactNode }>) {
  const session = await getAuthSession()
  if (!session) {
    redirect("/login")
  }

  const { slug } = await params
  const teams = await prisma.team.findMany({
    where: { members: { some: { member: { userId: session.user.id } } } },
  })
  // TODO: not found team with slug
  const selectedTeam = (await prisma.team.findUnique({ where: { slug } })) ?? undefined

  const isMember = session.user.members.some(member =>
    member.teams.some(team => team.teamId === selectedTeam?.id),
  )
  if (!isMember) {
    redirect("/forbidden")
  }

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <div className="flex gap-4">
        <TeamSwitcher
          teams={teams}
          selectedTeam={selectedTeam}
        />
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="space-x-1">
              <OverviewLink href={`/${slug}`} />
            </NavigationMenuItem>

            <NavigationMenuItem className="space-x-1">
              <GamesLink href={`/${slug}/games`} />
            </NavigationMenuItem>

            <Permission teamSlug={slug}>
              <NavigationMenuItem className="space-x-1">
                <MembersLink href={`/${slug}/members`} />
              </NavigationMenuItem>
            </Permission>
          </NavigationMenuList>
        </NavigationMenu>
        <DatePickerWithRange className="ml-auto" />
      </div>
      {children}
    </main>
  )
}
