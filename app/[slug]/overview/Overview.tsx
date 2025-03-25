import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrosshairIcon, ShieldIcon, SwordsIcon, VolleyballIcon } from "lucide-react"
import { LineChartScore } from "./LineChartScore"
import { StackedBarChartErrors } from "./StackedBarChartErrors"
import { BarChartMultiple } from "./BarChartMultiple"
import { columns, Leaderboard, leaderboardPlayers } from "./Leaderboard"
import { prisma } from "@/prisma/singlePrismaClient"
import { GameWithStatistic } from "../games/page"
import { round2DecimalPlaces } from "@/app/statistics/[slug]/columns/utils"

type OverviewProps = {
  teamSlug: string
  fromDateFilter?: Date
  toDateFilter?: Date
}

export const Overview = async ({ teamSlug, fromDateFilter, toDateFilter }: OverviewProps) => {
  const gameWhereQuery = {
    Team: { slug: teamSlug },
    score: { not: null, notIn: [""] },
    ...(!!fromDateFilter && !!toDateFilter
      ? { AND: { date: { gte: fromDateFilter, lte: toDateFilter } } }
      : {}),
  }

  const statistics = (
    await prisma.statistics.aggregate({
      where: { Game: gameWhereQuery },
      _sum: {
        kills: true,
        attackErrors: true,
        attackAttempts: true,
        serveAces: true,
        serveErrors: true,
        serveAttempts: true,
        receivePerfect: true,
        receivePositive: true,
        receiveNegative: true,
        receiveError: true,
        receiveAttempts: true,
        digs: true,
        digErrors: true,
        blockSingle: true,
        blockMultiple: true,
        blockErrors: true,
        setsPlayed: true,
      },
    })
  )._sum

  const games = await prisma.game.findMany({
    where: gameWhereQuery,
    include: { statistics: true },
    orderBy: { date: "desc" },
  })

  if (games.length === 0) {
    return <h1>No Games found.</h1>
  }

  const { wins, loses, winPercentage, totalGames } = calculateGamesOverview(games)

  const {
    totalKills,
    totalKillsPerSet,
    totalAttackEfficiency,
    totalDigs,
    totalBlocks,
    totalReceivePercentage,
    totalAces,
    totalServeErrors,
    totalServeEfficiency,
  } = calculateTotalStatistics(statistics)

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
              Win Percentage: {winPercentage}%, Wins: {wins}, Loses: {loses}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attack</CardTitle>
            <SwordsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency: {totalAttackEfficiency}</div>
            <p className="text-xs text-muted-foreground">
              Total Kills: {totalKills}, Kills per Set: {totalKillsPerSet}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defence</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Receive Percentage: {totalReceivePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Digs: {totalDigs}, Blocks: {totalBlocks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serve</CardTitle>
            <CrosshairIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency: {totalServeEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Aces: {totalAces}, Errors: {totalServeErrors}
            </p>
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

const calculateGamesOverview = (games: GameWithStatistic[]) => {
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
  const totalGames = games.length

  return {
    wins,
    loses,
    winPercentage,
    totalGames,
  }
}

const calculateTotalStatistics = (statistics: StatisticsAggregate) => {
  const totalKills = statistics.kills ?? 0
  const totalErrors = statistics.attackErrors ?? 0
  const totalSetsPlayed = statistics.setsPlayed ?? 0
  const totalAttackAttempts = statistics.attackAttempts ?? 0

  const totalDigs = statistics.digs ?? 0
  const totalBlocks = (statistics.blockSingle ?? 0) + (statistics.blockMultiple ?? 0)
  const totalReceivePerfect = statistics.receivePerfect ?? 0
  const totalReceivePositive = statistics.receivePositive ?? 0
  const totalReceiveNegative = statistics.receiveNegative ?? 0
  const totalReceiveAttempts = statistics.receiveAttempts ?? 0

  const totalAces = statistics.serveAces ?? 0
  const totalServeErrors = statistics.serveErrors ?? 0
  const totalServeAttempts = statistics.serveAttempts ?? 0

  const totalKillsPerSet = totalKills / totalSetsPlayed
  const totalAttackEfficiency = round2DecimalPlaces((totalKills - totalErrors) / totalAttackAttempts, 2)

  const totalReceivePercentage = round2DecimalPlaces(
    (totalReceivePerfect * 3 + totalReceivePositive * 2 + totalReceiveNegative) / totalReceiveAttempts,
    2,
  )

  const totalServeEfficiency = round2DecimalPlaces((totalAces - totalServeErrors) / totalServeAttempts, 2)

  return {
    totalKills,
    totalKillsPerSet,
    totalAttackEfficiency,
    totalDigs,
    totalBlocks,
    totalReceivePercentage,
    totalAces,
    totalServeErrors,
    totalServeEfficiency,
  }
}

type StatisticsAggregate = NonNullable<Awaited<ReturnType<typeof prisma.statistics.aggregate>>["_sum"]>
