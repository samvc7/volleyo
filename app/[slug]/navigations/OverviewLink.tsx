"use client"

import { NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { addDateRangeToUrl } from "./utils"

export const OverviewLink = ({ href }: { href: string }) => {
  const searchParams = useSearchParams()
  const from = searchParams.get("from") ?? undefined
  const to = searchParams.get("to") ?? undefined

  return (
    <Link
      href={addDateRangeToUrl(href, from, to)}
      legacyBehavior
      passHref
    >
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>Overview</NavigationMenuLink>
    </Link>
  )
}
