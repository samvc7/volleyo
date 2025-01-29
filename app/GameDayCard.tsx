import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

type GameDayCardProps = {
  id: number
  title: string
  date: Date
  address?: string
  participants?: string[]
}

export const GameDayCard = ({ id, title, date, address, participants }: GameDayCardProps) => {
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
            <CardDescription>Address: {address}</CardDescription>
          </CardHeader>
          <CardContent>
            <h2>Participants:</h2>
            <p>{participants?.map(player => player).join(", ")}</p>
          </CardContent>
        </Card>
      </Link>
    </li>
  )
}
