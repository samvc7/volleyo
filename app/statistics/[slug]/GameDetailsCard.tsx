import { EditGameDialog } from "@/app/[slug]/games/EditGameDialog"
import { Score } from "@/app/[slug]/games/GameCard"
import { GameWithRelations } from "@/app/[slug]/games/page"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

type GameDetailsCardProps = {
  game: GameWithRelations
  className?: string
}

export const GameDetailsCard = ({ game, className }: GameDetailsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{game.title}</CardTitle>
            <CardDescription>
              📅 {format(game.date, DATE_FORMAT)} 🕒 {format(game.date, TIME_FORMAT)} | 📍{" "}
              {game.location || "TBA"}
            </CardDescription>
          </div>
          <EditGameDialog game={game} />
        </div>
      </CardHeader>
      <CardContent>
        <Score
          teamName={game.team?.name}
          opponentName={game.opponentName}
          teamScore={game.teamScore}
          opponentScore={game.opponentScore}
        />
        {game.description && (
          <div className="mt-4">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm">{game.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
