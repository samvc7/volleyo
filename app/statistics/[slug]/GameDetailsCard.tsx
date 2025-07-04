"use client"

import { useState, useTransition } from "react"
import { EditGameDialog } from "@/app/[slug]/games/EditGameDialog"
import { Score } from "@/app/[slug]/games/GameCard"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ChevronUp, ChevronDown, Users, XIcon, Loader2 } from "lucide-react"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"
import { Prisma } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { positionBadgeColors, positionShortLabels } from "./columns/utils"
import { ConfirmDataLossDialog } from "./ConfirmDataLossDialog"
import { deleteStatistics } from "./actions"
import { toast } from "@/hooks/use-toast"

type GameDetailsCardProps = {
  game: Prisma.GameGetPayload<{
    include: {
      statistics: { include: { member: { select: { firstName: true; lastName: true } } } }
      team?: true
    }
  }>
}

export const GameDetailsCard = ({ game }: GameDetailsCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{game.title}</CardTitle>
            <CardDescription className="inline-flex items-center gap-2">
              📅 {format(game.date, DATE_FORMAT)} 🕒 {format(game.date, TIME_FORMAT)} | 📍{" "}
              {game.location || "TBA"} |
              <span className="flex items-center gap-1">
                <Users size={14} />
                {game.statistics.length ?? 0}
              </span>
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

          <div className="mt-4">
            <h3 className="font-semibold">Attendees</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {game.statistics.map(statistic => (
                <li
                  key={statistic.id}
                  className="flex flex-row justify-between items-center p-2 border rounded-lg"
                >
                  <AttendeeCard statistic={statistic} />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

type AttendeeCardProps = {
  statistic: Prisma.StatisticsGetPayload<{
    include: { member: { select: { firstName: true; lastName: true } } }
  }>
}

const AttendeeCard = ({ statistic }: AttendeeCardProps) => {
  const [isRemoving, startRemovingTransition] = useTransition()

  const handleRemove = () => {
    startRemovingTransition(() => {
      try {
        deleteStatistics([statistic.id])
        toast({ title: "Successfully deleted statistics" })
      } catch (error) {
        console.error(error)
        toast({ title: "Could not delete statistics. Please try again" })
      }
    })
  }

  return (
    <>
      <div>
        <div className="text-sm font-semibold">{`${statistic.member.firstName} ${statistic.member.lastName}`}</div>
        <Badge
          key={`attendee-position-${statistic.id}`}
          variant="outline"
          className={positionBadgeColors["OUTSIDE_HITTER"]}
        >
          {positionShortLabels["OUTSIDE_HITTER"]}
        </Badge>

        <Badge
          variant="outline"
          className={"border-emerald-500 text-emerald-600"}
        >
          Test Position
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <Badge
          variant="outline"
          className="flex border-gray-100 bg-gray-100 text-black"
        >
          {isRemoving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-1" /> <span>Removing</span>
            </>
          ) : (
            "Pending"
          )}
        </Badge>

        <ConfirmDataLossDialog onConfirmAction={handleRemove}>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
          >
            <XIcon />
          </Button>
        </ConfirmDataLossDialog>
      </div>
    </>
  )
}
