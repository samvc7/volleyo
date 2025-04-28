import { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { TeamRole } from "@prisma/client"

type PermissionClientProps = {
  teamSlug: string
  children: ReactNode
}

export function PermissionClient({ teamSlug, children }: PermissionClientProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null
  }

  const hasPermission = session?.user?.teamRoles?.[teamSlug] === TeamRole.ADMIN

  if (!hasPermission) {
    return null
  }

  return <>{children}</>
}
