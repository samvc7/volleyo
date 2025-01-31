import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrosshairIcon, ShieldIcon, SwordsIcon, VolleyballIcon } from "lucide-react"
import { LineChartScore } from "./LineChartScore"
import { StackedBarChartErrors } from "./StackedBarChartErrors"
import { BarChartMultiple } from "./BarChartMultiple"
import { columns, Leaderboard, leaderboardPlayers } from "./Leaderboard"

export const Overview = () => {
  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Overview</CardTitle>
            <VolleyballIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Total Games: 25</div>
            <p className="text-xs text-muted-foreground">Win Percentage: 72%, Wins: 18, Loses: 7</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attack</CardTitle>
            <SwordsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency: 0.35</div>
            <p className="text-xs text-muted-foreground">Total Kills: 780, Kills per Set: 12.5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defence</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Receive Efficiency: 0.35</div>
            <p className="text-xs text-muted-foreground">Digs: 465, Blocks: 92</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serve</CardTitle>
            <CrosshairIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency: 89%</div>
            <p className="text-xs text-muted-foreground">Aces: 105, Errors: 47</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <LineChartScore />
        <StackedBarChartErrors />
        <BarChartMultiple />
        <Leaderboard
          columns={columns}
          data={leaderboardPlayers}
        />
      </div>
    </>
  )
}
