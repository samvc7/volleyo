"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "./UserMenu"
import { Button } from "@/components/ui/button"

export const SessionNav = () => {
  const { data: session, status } = useSession()

  if (status === "loading" || !session?.user) return null

  return (
    <div className="w-full flex items-center justify-between">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              href="/"
              legacyBehavior
              passHref
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Teams</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {session?.user ? <UserMenu user={session.user} /> : <Button onClick={() => signIn()}>Login</Button>}
    </div>
  )
}
