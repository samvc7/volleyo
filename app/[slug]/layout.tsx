import { ReactNode } from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { DatePickerWithRange } from "../DateRangePicker"
import { TeamSwitcher } from "../team-switcher/TeamSwitcher"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { StatisticsLink } from "./navigations/StatisticsLink"
import { EventLink } from "./navigations/EventLink"
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
    orderBy: { name: "asc" },
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
    <>
      <div className="flex gap-4">
        <TeamSwitcher
          teams={teams}
          selectedTeam={selectedTeam}
        />
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="space-x-1">
              <EventLink href={`/${slug}/events`} />
            </NavigationMenuItem>

            <NavigationMenuItem className="space-x-1">
              <StatisticsLink href={`/${slug}/statistics`} />
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
    </>
  )
}
