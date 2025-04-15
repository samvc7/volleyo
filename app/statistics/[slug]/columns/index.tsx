import { ColumnDef } from "@tanstack/react-table"
import {
  actionsColumn,
  attackGroupColum,
  blockGroupColumn,
  digGroupColumn,
  generalGroupColumn,
  nameColumn,
  positionColumn,
  receiveGroupColumn,
  selectActionColumn,
  serveGroupColumn,
  setsGroupColumn,
} from "./columns"
import { Position } from "@prisma/client"

// research: Need to use invertSorting because sortDescFirst is not working
export const columns: ColumnDef<Statistics>[] = [
  selectActionColumn,
  nameColumn,
  positionColumn,
  attackGroupColum,
  serveGroupColumn,
  receiveGroupColumn,
  setsGroupColumn,
  digGroupColumn,
  blockGroupColumn,
  generalGroupColumn,
  actionsColumn,
]

// Maybe use Zod schema here later
export type Statistics = {
  id: string
  name: string
  positions?: Position[]
  // attack
  kills?: number
  attackErrors?: number
  attackAttempts?: number
  attackEfficiency?: number
  killsPerSet?: number
  // serve
  serveAces?: number
  serveErrors?: number
  serveAttempts?: number
  servePercentage?: number
  serveEfficiency?: number
  serveRating?: number
  // serve receive
  receivePerfect?: number
  receivePositive?: number
  receiveNegative?: number
  receiveError?: number
  receiveAttempts?: number
  receivePercentage?: number
  // sets
  setAssists?: number
  setsTotal?: number
  setErrors?: number
  // digs
  digs?: number
  digErrors?: number
  blockSingle?: number
  blockMultiple?: number
  blockErrors?: number
  blocksPerSet?: number
  setsPlayed?: number
  // relations
  memberId?: string
  gameId?: string
}
