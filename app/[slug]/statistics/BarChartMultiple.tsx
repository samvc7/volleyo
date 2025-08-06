"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"
import { DATE_FORMAT } from "@/app/utils"

const chartConfig = {
  attempts: {
    label: "Attacks",
    color: "hsl(var(--chart-2))",
  },
  errors: {
    label: "Errors",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function BarChartMultiple({
  chartData,
}: {
  chartData: { date: string; attempts: number; errors: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attack</CardTitle>
        <CardDescription>Showing total attacks and errors.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => format(new Date(value), DATE_FORMAT)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="attempts"
              fill="var(--color-attempts)"
              radius={4}
            />
            <Bar
              dataKey="errors"
              fill="var(--color-errors)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
