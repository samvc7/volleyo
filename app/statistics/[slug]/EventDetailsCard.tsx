"use client"

import { useState } from "react"
import { EditEventDialog } from "@/app/[slug]/events/EditEventDialog"
import { Score } from "@/app/[slug]/events/EventCard"
import { DATE_FORMAT, TIME_FORMAT } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ChevronUp, ChevronDown, Users } from "lucide-react"
import { PermissionClient } from "@/components/ui/custom/PermissionClient"
import { isEventCompetitive } from "../util"
import { EventWithRelations } from "@/app/[slug]/events/page"

type EventDetailsCardProps = {
  event: EventWithRelations
  enableCollapse?: boolean
}

export const EventDetailsCard = ({ event, enableCollapse = true }: EventDetailsCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{event.title}</CardTitle>
            <CardDescription className="inline-flex items-center gap-2">
              {event.date ? (
                <>
                  📅 {format(event.date, DATE_FORMAT)} 🕒 {format(event.date, TIME_FORMAT)}
                </>
              ) : (
                <>📅 TBA</>
              )}
              | 📍 {event.location || "TBA"} |
              <span className="flex items-center gap-1">
                <Users size={14} />
                {event.attendees.length ?? 0}
              </span>
            </CardDescription>
          </div>

          <PermissionClient teamSlug={event.team?.slug || ""}>
            <EditEventDialog event={event} />
          </PermissionClient>

          {enableCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(prev => !prev)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          {isEventCompetitive(event.type) && (
            <Score
              teamName={event.team?.name}
              opponentName={event.opponentName}
              teamScore={event.teamScore}
              opponentScore={event.opponentScore}
            />
          )}
          {event.description && (
            <div className="mt-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm">{event.description}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
