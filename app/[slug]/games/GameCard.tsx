import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SquarePen, Users } from "lucide-react"
import { GameWithStatistic } from "./page"
import { Game } from "@prisma/client"
import { DATE_FORMAT } from "@/app/utils"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
          {isEditable ? (
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Edit game</span>
              <SquarePen className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 h-full">
          <div>
            <div className="text-sm text-muted-foreground">
              <div>📅 {format(game.date, DATE_FORMAT)}</div>
              <div>📍 TBA</div>
              <p>{game.description}</p>
            </div>
            {participantsCount !== undefined ? (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users size={16} />
                {participantsCount}
              </div>
            ) : null}
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
      </CardContent>
    </Card>
  )
}
