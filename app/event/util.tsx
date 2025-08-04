import { EventType } from "@prisma/client"

const COMPETITIVE_EVENT_TYPES = new Set<EventType>([EventType.MATCH, EventType.TRAINING])

export const isEventCompetitive = (eventType: EventType) => {
  return COMPETITIVE_EVENT_TYPES.has(eventType)
}
