import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type PermissionProps = {
  teamSlug: string
  children: ReactNode
}

export async function Permission({ teamSlug, children }: PermissionProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const hasRequiredRole = session.user.teamRoles[teamSlug] === "ADMIN"

  if (!hasRequiredRole) {
    return null
  }

  return <>{children}</>
}
