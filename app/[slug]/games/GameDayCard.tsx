import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { GameWithStatistic } from "./page"

type GameDayCardProps = {
  game: GameWithStatistic
}

export const GameCard = ({ game: { title, slug, date, description, statistics } }: GameDayCardProps) => {
  return (
    <li>
      <Link
        href={`/statistics/${slug}`}
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
          <CardContent className="flex items-center gap-1">
            <Users size={16} />
            {statistics.length}
          </CardContent>
        </Card>
      </Link>
    </li>
  )
}
