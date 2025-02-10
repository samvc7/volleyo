import Link from "next/link"
import { Person } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { parsePersonName } from "@/app/utils"

type GameDayCardProps = {
  id: string
  title: string
  date: Date
  description?: string | null
  participants?: Pick<Person, "firstName" | "lastName" | "nickName">[]
}

export const GameCard = ({ id, title, date, description, participants }: GameDayCardProps) => {
  return (
    <li>
      <Link
        // TODO: add id as slug
        href="/statistics"
        legacyBehavior
        passHref
      >
        <Card className="hover:bg-slate-100 dark:hover:bg-slate-50 cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{title}</CardTitle>
              <div className="font-sm text-slate-500 dark:text-slate-400">
                {date.toLocaleDateString("de")}
              </div>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {participants?.length ? (
              <>
                <h2>Participants:</h2>
                <p>{participants?.map(participant => parsePersonName(participant)).join(", ")}</p>
              </>
            ) : (
              <h2>No participants yet.</h2>
            )}
          </CardContent>
        </Card>
      </Link>
    </li>
  )
}
