import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { EventWithRelations } from "./page"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { isEventCompetitive } from "@/app/event/util"

type EventCardLinkProps = {
  event: EventWithRelations
}

export const EventCardLink = ({ event }: EventCardLinkProps) => {
  return (
    <Link
      href={`/event/${event.slug}`}
      legacyBehavior
      passHref
    >
      <Card className="hover:bg-slate-100 dark:hover:bg-slate-50 cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <h2>{event.title}</h2>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 h-full">
            <div>
              <div className="text-sm text-muted-foreground">
                <div>
                  {event.date ? (
                    <>
                      📅 {format(event.date, DATE_FORMAT)} ⏰ {format(event.date, TIME_FORMAT)}
                    </>
                  ) : (
                    <>📅 TBA</>
                  )}
                </div>
                <div>📍 {event.location || "TBA"}</div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {event.attendees.length ?? 0}
                </div>
              </div>
            </div>

            {isEventCompetitive(event.type) && (
              <Score
                teamName={event.team?.name}
                opponentName={event.opponentName}
                teamScore={event.teamScore}
                opponentScore={event.opponentScore}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const Score = ({
  teamName,
  opponentName,
  teamScore,
  opponentScore,
}: {
  teamName?: string
  opponentName: string | null
  teamScore: number | null
  opponentScore: number | null
}) => {
  const winLoseColor =
    !teamScore || !opponentScore ? "" : teamScore > opponentScore ? "text-green-600" : "text-red-600"

  return (
    <div className="flex justify-center gap-6 h-full">
      <div className="text-center">
        <h3 className="font-semibold">{teamName || "Team"}</h3>
        <div className={cn("text-5xl font-bold", winLoseColor)}>{teamScore}</div>
      </div>
      <div className="font-semibold">vs</div>
      <div className="text-center">
        <h3 className="font-semibold">{opponentName || "Opponent"}</h3>
        <div className={cn("text-5xl font-bold", winLoseColor)}>{opponentScore}</div>
      </div>
    </div>
  )
}
