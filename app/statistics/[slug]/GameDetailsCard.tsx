"use client"

import { useState } from "react"
import { EditGameDialog } from "@/app/[slug]/games/EditGameDialog"
import { Score } from "@/app/[slug]/games/GameCard"
import { GameWithRelations } from "@/app/[slug]/games/page"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ChevronUp, ChevronDown } from "lucide-react"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"

type GameDetailsCardProps = {
  game: GameWithRelations
}

export const GameDetailsCard = ({ game }: GameDetailsCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{game.title}</CardTitle>
            <CardDescription>
              📅 {format(game.date, DATE_FORMAT)} 🕒 {format(game.date, TIME_FORMAT)} | 📍{" "}
              {game.location || "TBA"}
            </CardDescription>
          </div>

          <PermissionClient teamSlug={game.team?.slug || ""}>
            <EditGameDialog game={game} />
          </PermissionClient>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(prev => !prev)}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
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
      )}
    </Card>
  )
}
