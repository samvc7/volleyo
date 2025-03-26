"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { GameWithStatistic } from "../games/page"
import { DATE_ISO_FORMAT } from "@/app/utils"
import { format } from "date-fns"

const chartConfig = {
  scores: {
    label: "Scores",
    color: "hsl(var(--chart-2))",
  },
  errors: {
    label: "Errors",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type LineChartScoreProps = {
  games: GameWithStatistic[]
}

export function LineChartScore({ games }: LineChartScoreProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("scores")

  const data = games.map(game => ({
    date: format(game.date, DATE_ISO_FORMAT),
    scores: game.statistics.reduce((acc, curr) => {
      const kills = curr.kills ?? 0
      const blocks = (curr.blockSingle ?? 0) + (curr.blockMultiple ?? 0)
      const aces = curr.serveAces ?? 0
      const scores = kills + blocks + aces

      return acc + scores
    }, 0),
    errors: game.statistics.reduce((acc, curr) => {
      const attackErrors = curr.attackErrors ?? 0
      const serveErrors = curr.serveErrors ?? 0
      const receiveErrors = curr.receiveError ?? 0
      const setErrors = curr.setErrors ?? 0
      const digErrors = curr.digErrors ?? 0
      const blockErrors = curr.blockErrors ?? 0

      const errors = attackErrors + serveErrors + receiveErrors + setErrors + digErrors + blockErrors

      return acc + errors
    }, 0),
  }))

  const total = React.useMemo(
    () => ({
      scores: data.reduce((acc, curr) => acc + curr.scores, 0),
      errors: data.reduce((acc, curr) => acc + curr.errors, 0),
    }),
    [],
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Scores vs. Errors</CardTitle>
          <CardDescription>Showing overall scores and errors</CardDescription>
        </div>
        <div className="flex">
          {["scores", "errors"].map(key => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">{chartConfig[chart].label}</span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
