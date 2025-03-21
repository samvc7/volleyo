import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrosshairIcon, ShieldIcon, SwordsIcon, VolleyballIcon } from "lucide-react"
import { LineChartScore } from "./LineChartScore"
import { StackedBarChartErrors } from "./StackedBarChartErrors"
import { BarChartMultiple } from "./BarChartMultiple"
import { columns, Leaderboard, leaderboardPlayers } from "./Leaderboard"
import { Game } from "@prisma/client"
import { prisma } from "@/prisma/singlePrismaClient"
import { subDays } from "date-fns"

type OverviewProps = {
  teamSlug: string
  fromDateFilter: Date
  toDateFilter: Date
}

export const Overview = async ({ teamSlug, fromDateFilter, toDateFilter }: OverviewProps) => {
  const defaultFromDate = subDays(new Date(), 30)
  const defaultToDate = new Date()

  const games = await prisma.game.findMany({
    where: {
      Team: { slug: teamSlug },
      score: { not: null, notIn: [""] },
      ...(fromDateFilter && toDateFilter
        ? { AND: { date: { gte: defaultFromDate, lte: defaultToDate } } }
        : {}),
    },
    orderBy: { date: "desc" },
  })

  const { wins, loses, winPercentage, totalGames } = calculateGamesOverview(games)

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Overview</CardTitle>
            <VolleyballIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Total Games: {totalGames}</div>
            <p className="text-xs text-muted-foreground">
              Win Percentage: {winPercentage}, Wins: {wins}, Loses: {loses}
            </p>
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

const calculateGamesOverview = (games: Game[]) => {
  let wins = 0
  let loses = 0

  games.forEach(game => {
    if (!game.score) return

    const [ourScore, enemyScore] = game.score.split("-").map(Number)
    if (ourScore > enemyScore) {
      wins++
    } else {
      loses++
    }
  })

  const winPercentage = games.length > 0 ? Math.ceil((wins / games.length) * 10000) / 100 : 0
  return { wins, loses, winPercentage: `${winPercentage}%`, totalGames: games.length }
}
