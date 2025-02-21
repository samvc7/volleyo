import { ReactNode } from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { DatePickerWithRange } from "../DateRangePicker"
import { TeamSwitcher } from "../team-switcher/TeamSwitcher"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { OverviewLink } from "./navigations/OverviewLink"
import { GamesLink } from "./navigations/GamesLink"
import { MembersLink } from "./navigations/MembersLink"

export default async function Layout({
  params,
  children,
}: Readonly<{ params: Promise<{ slug: string }>; children: ReactNode }>) {
  const { slug } = await params
  const teams = await prisma.team.findMany()
  // TODO: not found team with slug
  const selectedTeam = (await prisma.team.findUnique({ where: { slug } })) ?? undefined

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

            <NavigationMenuItem className="space-x-1">
              <MembersLink href={`/${slug}/members`} />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <DatePickerWithRange className="ml-auto" />
      </div>
      {children}
    </main>
  )
}
