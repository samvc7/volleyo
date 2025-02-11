import { ReactNode } from "react"
import Link from "next/link"
import { prisma } from "@/prisma/singlePrismaClient"
import { DatePickerWithRange } from "../DateRangePicker"
import { TeamSwitcher } from "../team-switcher/TeamSwitcher"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
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
              <Link
                href={`/${slug}`}
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Overview</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem className="space-x-1">
              <Link
                href={`/${slug}/games`}
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Games</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem className="space-x-1">
              <Link
                href={`/${slug}/members`}
                legacyBehavior
                passHref
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Members</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <DatePickerWithRange className="ml-auto" />
      </div>
      {children}
    </main>
  )
}
