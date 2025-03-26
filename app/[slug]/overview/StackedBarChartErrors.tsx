"use client"

import { Bar, BarChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { GameWithStatistic } from "../games/page"
import { format } from "date-fns"
import { DATE_FORMAT, DATE_ISO_FORMAT } from "@/app/utils"

const chartConfig = {
  attack: {
    label: "Attack",
    color: "hsl(var(--chart-1))",
  },
  receive: {
    label: "Receive",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function StackedBarChartErrors({ games }: { games: GameWithStatistic[] }) {
  const chartData = games.map(game => {
    return {
      date: format(game.date, DATE_ISO_FORMAT),
      attack: game.statistics.reduce((acc, stat) => acc + (stat.attackErrors ?? 0), 0),
      receive: game.statistics.reduce((acc, stat) => acc + (stat.receiveError ?? 0), 0),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Distribution</CardTitle>
        <CardDescription>Visualizing error distribution accross attack and receive.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => {
                return format(new Date(value), DATE_FORMAT)
              }}
            />
            <Bar
              dataKey="attack"
              stackId="a"
              fill="var(--color-attack)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="receive"
              stackId="a"
              fill="var(--color-receive)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[180px]"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label || name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">errors</span>
                      </div>
                      {/* Add this after the last item */}
                      {index === 1 && (
                        <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                          Total
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {item.payload.attack + item.payload.receive}
                            <span className="font-normal text-muted-foreground">errors</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                />
              }
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
