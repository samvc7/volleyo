import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { GameWithStatistic } from "./page"
import { Game } from "@prisma/client"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { EditGameDialog } from "./EditGameDialog"

type GameCardLinkProps = {
  game: GameWithStatistic
}

export const GameCardLink = ({ game }: GameCardLinkProps) => {
  const { statistics, ...gameRest } = game
  return (
    <Link
      href={`/statistics/${game.slug}`}
      legacyBehavior
      passHref
    >
      <GameCard
        game={gameRest}
        participantsCount={statistics.length}
        className="hover:bg-slate-100 dark:hover:bg-slate-50 cursor-pointer"
      />
    </Link>
  )
}

type GameCardProps = {
  game: Game
  participantsCount?: number
  isEditable?: boolean
  className?: string
}

export const GameCard = ({ game, participantsCount, isEditable = false, className }: GameCardProps) => {
  const winLoseColor =
    !game.teamScore || !game.opponentScore
      ? ""
      : game.teamScore > game.opponentScore
      ? "text-green-600"
      : "text-red-600"

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{game.title}</CardTitle>
          {isEditable ? <EditGameDialog game={game} /> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 h-full">
          <div>
            <div className="text-sm text-muted-foreground">
              <div>
                📅 {format(game.date, DATE_FORMAT)} ⏰ {format(game.date, TIME_FORMAT)}
              </div>
              <div>📍 {game.location || "TBA"}</div>
              {participantsCount !== undefined ? (
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {participantsCount}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center gap-6 h-full">
            <div className="text-center">
              <h3 className="font-semibold">Team Score</h3>
              <div className={cn("text-5xl font-bold", winLoseColor)}>{game.teamScore}</div>
            </div>
            <div className="font-semibold">vs</div>
            <div className="text-center">
              <h3 className="font-semibold">Opponent Score</h3>
              <div className={cn("text-5xl font-bold", winLoseColor)}>{game.opponentScore}</div>
            </div>
          </div>
        </div>
        <CardDescription>{game.description}</CardDescription>
      </CardContent>
    </Card>
  )
}
