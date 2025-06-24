"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useStatistics } from "../StatisticsProvider"
import { Statistics } from "../columns"
import { SplitCounterButton } from "./SplitCounterButton"
import { useSessionStorage } from "@uidotdev/usehooks"

type StatKey = keyof Statistics

type Stat = {
  key: StatKey
  name: string
}

const DEFAULT_STATS: Stat[] = [
  { key: "kills", name: "Attack" },
  { key: "blockMultiple", name: "Block" },
  { key: "digs", name: "Dig" },
  { key: "setAssists", name: "Set" },
  { key: "serveAces", name: "Ace" },
]

export default function CourtTracker() {
  const DEFAULT_TIMEOUTS = 2
  const DEFAULT_SUBSTITUTIONS = 6

  const { statistics, setStatistics, setHasUnsavedChanges, gameSlug } = useStatistics<Statistics>()
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [selectedBench, setSelectedBench] = useState<string>("")
  const [savedPositions, savePositions] = useSessionStorage<(string | undefined)[]>(
    `${gameSlug}-court-positions`,
    [],
  )
  const statisticsFromPositions = savedPositions.map(position => {
    return statistics.find(stat => stat.id === position)
  })
  const [courtPositions, setCourtPositions] = useState<(Statistics | undefined)[]>(
    statisticsFromPositions.length > 0 ? statisticsFromPositions : Array(6).fill(undefined),
  )
  const playersNotOnCourt = statistics.filter(stat => !courtPositions.some(pos => pos?.id === stat.id))
  const [benched, setBenched] = useState<Statistics[]>(playersNotOnCourt)
  const [timoutCount, setTimeoutCount] = useSessionStorage(`${gameSlug}-timeouts`, DEFAULT_TIMEOUTS)
  const [subCount, setSubCount] = useSessionStorage(`${gameSlug}-subs`, DEFAULT_SUBSTITUTIONS)

  const selectedPositionIx = Number(selectedPosition.split("-")[1])
  const selectedCourtPlayer = courtPositions[selectedPositionIx]
  const statsOfSelectedPlayer = statistics.find(stat => stat.id === selectedCourtPlayer?.id)

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }

    if (savedPositions.length > 0) {
      window.addEventListener("beforeunload", handleBeforeUnload)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const handleIncrementStat = (statKey: StatKey) => {
    setStatistics(prev => {
      const newStatistics = [...prev]
      const index = newStatistics.findIndex(stat => stat.id === selectedCourtPlayer?.id)
      if (index !== -1) {
        const previousStat = prev[index][statKey] as number
        newStatistics[index] = {
          ...newStatistics[index],
          [statKey]: previousStat + 1,
        }
      }

      return newStatistics
    })
    setHasUnsavedChanges(true)
  }

  const handleDecrementStat = (statKey: StatKey) => {
    setStatistics(prev => {
      const newStatistics = [...prev]
      const index = newStatistics.findIndex(stat => stat.id === selectedCourtPlayer?.id)
      if (index !== -1) {
        const previousStat = prev[index][statKey] as number
        newStatistics[index] = {
          ...newStatistics[index],
          [statKey]: Math.max(previousStat - 1, 0),
        }
      }

      return newStatistics
    })

    setHasUnsavedChanges(true)
  }

  const handleSubstitute = () => {
    const selectedBenchPlayer = statistics.find(stat => stat.id === selectedBench)
    if (!selectedBenchPlayer) return

    setCourtPositions(prev => {
      const newCourtPosition = [...prev]
      newCourtPosition[selectedPositionIx] = selectedBenchPlayer
      return newCourtPosition
    })

    setSelectedBench("")
    setBenched(prev => {
      const newBenched = [...prev]
      const index = newBenched.findIndex(stat => stat.id === selectedBenchPlayer.id)
      if (index !== -1) {
        newBenched.splice(index, 1)
      }

      if (selectedCourtPlayer) {
        newBenched.push(selectedCourtPlayer)
      }
      return newBenched
    })

    const positionsToSave = [...courtPositions]
    positionsToSave[selectedPositionIx] = selectedBenchPlayer
    savePositions(positionsToSave.map(stat => stat?.id ?? ""))

    if (selectedCourtPlayer) {
      setSubCount(prev => Math.max(prev - 1, 0))
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 my-4">
        <Card className="w-full p-4 md:p-12 border rounded-md">
          <ToggleGroup
            className="grid grid-cols-3 gap-4 md:gap-12"
            type="single"
            value={selectedPosition}
            onValueChange={val => setSelectedPosition(val ?? "")}
          >
            {courtPositions.map((stat, index) => {
              return (
                <Label
                  key={`position-${index}`}
                  className="cursor-pointer"
                >
                  <ToggleGroupItem
                    value={`position-${index}`}
                    className="sr-only"
                    id={`player-${`position-${index}`}`}
                  />
                  <Card
                    className={cn(
                      "transition-all aspect-[4/3] relative overflow-hidden flex items-center justify-center",
                      selectedPosition === `position-${index}`
                        ? "border-green-600 ring-2 ring-green-600"
                        : "hover:border-muted hover:bg-muted",
                    )}
                  >
                    <div className="absolute font-bold text-muted-foreground/10 text-responsive-number pointer-events-none select-none z-0">
                      {index + 1}
                    </div>
                    <CardContent className="p-4">
                      <span className="font-medium">{shortenName(stat?.name)}</span>
                    </CardContent>
                  </Card>
                </Label>
              )
            })}
          </ToggleGroup>
        </Card>

        <Card className="flex flex-wrap flex-row md:flex-col gap-2 sm:gap-1 lg:gap-6 p-4">
          {DEFAULT_STATS.map(stat => {
            const currentStatValue = (statsOfSelectedPlayer?.[stat.key] ?? 0) as number

            return (
              <SplitCounterButton
                key={stat.key}
                value={currentStatValue}
                onIncrement={() => handleIncrementStat(stat.key)}
                disabledIncrement={!selectedCourtPlayer}
                onDecrement={() => handleDecrementStat(stat.key)}
                disabledDecrement={!selectedCourtPlayer || currentStatValue <= 0}
                label={stat.name}
              />
            )
          })}
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="font-medium">Bench Players</CardTitle>
          <CardDescription className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <span className="w-20">Timeouts</span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimeoutCount(prev => {
                      if (prev > 0) {
                        return prev - 1
                      }
                      return prev
                    })
                  }}
                  disabled={timoutCount <= 0}
                >
                  –
                </Button>
                <span>{timoutCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeoutCount(prev => prev + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimeoutCount(DEFAULT_TIMEOUTS)}
              >
                Reset
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="w-20">Subs</span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubCount(prev => {
                      if (prev > 0) {
                        return prev - 1
                      }
                      return prev
                    })
                  }}
                  disabled={subCount <= 0}
                >
                  –
                </Button>
                <span>{subCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubCount(prev => prev + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubCount(DEFAULT_SUBSTITUTIONS)}
              >
                Reset
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            className="flex flex-wrap gap-6 justify-start"
            type="single"
            onValueChange={val => setSelectedBench(val ?? "")}
          >
            {benched.length === 0 && <div>No players available</div>}
            {benched.map(stat => {
              return (
                <Label
                  key={stat.id}
                  className="cursor-pointer w-[120px]"
                >
                  <ToggleGroupItem
                    value={stat.id}
                    className="sr-only"
                    id={`player-${`bench-${stat.id}`}`}
                  />
                  <Card
                    className={cn(
                      "transition-all aspect-[4/3] flex items-center justify-center",
                      selectedBench === stat.id
                        ? "border-slate-600 ring-2 ring-slate-600"
                        : "hover:border-muted hover:bg-muted",
                    )}
                  >
                    <CardContent className="p-4">
                      <span className="font-semibold">{shortenName(stat.name)}</span>
                    </CardContent>
                  </Card>
                </Label>
              )
            })}
          </ToggleGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubstitute}>Substitute</Button>
        </CardFooter>
      </Card>
    </>
  )
}

const shortenName = (name?: string) => {
  if (!name) return name
  const [firstName, lastName] = name.split(" ")
  return `${firstName.charAt(0)}. ${lastName.trim()}`
}
