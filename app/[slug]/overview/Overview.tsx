import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrosshairIcon, ShieldIcon, SwordsIcon, Volleyball, VolleyballIcon } from "lucide-react"
import { LineChartScore } from "./LineChartScore"
import { StackedBarChartErrors } from "./StackedBarChartErrors"
import { BarChartMultiple } from "./BarChartMultiple"
import { columns, Leaderboard } from "./Leaderboard"
import { prisma } from "@/prisma/singlePrismaClient"
import { round2DecimalPlaces } from "@/app/statistics/[slug]/columns/utils"
import { format } from "date-fns"
import { DATE_ISO_FORMAT } from "@/app/utils"
import { Event, EventType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EventWithRelations } from "../events/page"

type OverviewProps = {
  teamSlug: string
  fromDateFilter?: Date
  toDateFilter?: Date
}

export const Overview = async ({ teamSlug, fromDateFilter, toDateFilter }: OverviewProps) => {
  const hasDateFilter = !!fromDateFilter && !!toDateFilter
  const eventWhereQuery = {
    team: { slug: teamSlug },
    AND: [
      { teamScore: { not: null }, opponentScore: { not: null } },
      { type: { notIn: [EventType.SOCIAL, EventType.OTHER] } },
    ],
    date: {
      not: null,
      ...(hasDateFilter ? { gte: fromDateFilter, lte: toDateFilter } : {}),
    },
  }

  const statistics = (
    await prisma.statistics.aggregate({
      where: { attendee: { event: eventWhereQuery } },
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
      ...(hasDateFilter ? { take: 30 } : {}),
    })
  )._sum

  const events = (await prisma.event.findMany({
    where: eventWhereQuery,
    include: { attendees: { include: { statistics: true } } },
    orderBy: { date: "asc" },
    ...(!hasDateFilter ? { take: 30 } : {}),
  })) as EventWithDate[]

  const leaderBoardStatistics = await prisma.statistics.groupBy({
    by: ["attendeeId"],
    where: { attendee: { event: eventWhereQuery } },
    _sum: {
      kills: true,
      attackAttempts: true,
      serveAces: true,
      blockSingle: true,
      blockMultiple: true,
      digs: true,
      setAssists: true,
    },
  })

  // TODO: refactor to only get the members
  const leaderBoardPlayers = await prisma.attendee.findMany({
    where: { id: { in: leaderBoardStatistics.map(data => data.attendeeId) } },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nickName: true,
        },
      },
    },
  })

  const leaderBoardData = leaderBoardStatistics.map(statistic => {
    const player = leaderBoardPlayers.find(player => player.id === statistic.attendeeId)

    // TODO: handle not found player

    const kills = statistic._sum.kills ?? 0
    const serveAces = statistic._sum.serveAces ?? 0
    const blocks = (statistic._sum.blockSingle ?? 0) + (statistic._sum.blockMultiple ?? 0)
    const digs = statistic._sum.digs ?? 0
    const setAssists = statistic._sum.setAssists ?? 0

    const score = kills * 1.5 + serveAces * 1.2 + blocks + digs * 0.75 + setAssists * 0.75

    return {
      playerId: player?.memberId ?? "",
      name: player?.member.nickName ?? `${player?.member.firstName} ${player?.member.lastName}`,
      kills,
      blocks,
      serveAces,
      digs,
      setAssists,
      score,
    }
  })

  const top5Players = leaderBoardData.sort((a, b) => b.score - a.score).slice(0, 5)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
        <div className="mb-4 rounded-full bg-muted p-6">
          {<Volleyball className="h-12 w-12 text-muted-foreground" />}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">No statistics yet.</h2>
        <p className="text-muted-foreground max-w-md mt-2 mb-6">
          There are no games found and therefor no statistics to show. Start planning your games by adding new
          games and document statistics.
        </p>
        <Link
          href={`/${teamSlug}/events`}
          legacyBehavior
          passHref
        >
          <Button variant="outline">Go to Events</Button>
        </Link>
      </div>
    )
  }

  const { wins, loses, winPercentage, totalGames } = calculateGamesOverview(events)

  const {
    totalKills,
    totalAttackErrors,
    totalAttackAttempts,
    totalAttackEfficiency,
    totalDigs,
    totalBlocks,
    totalReceivePercentage,
    totalAces,
    totalServeErrors,
    totalServeAttempts,
    totalServeEfficiency,
  } = calculateTotalStatistics(statistics)

  const scoresChartData = events.map(event => ({
    date: format(event.date, DATE_ISO_FORMAT),
    scores: event.attendees.reduce((acc, curr) => {
      const kills = curr.statistics?.kills ?? 0
      const blocks = (curr.statistics?.blockSingle ?? 0) + (curr.statistics?.blockMultiple ?? 0)
      const aces = curr.statistics?.serveAces ?? 0
      const scores = kills + blocks + aces

      return acc + scores
    }, 0),
    errors: event.attendees.reduce((acc, curr) => {
      const attackErrors = curr.statistics?.attackErrors ?? 0
      const serveErrors = curr.statistics?.serveErrors ?? 0
      const receiveErrors = curr.statistics?.receiveError ?? 0
      const setErrors = curr.statistics?.setErrors ?? 0
      const digErrors = curr.statistics?.digErrors ?? 0
      const blockErrors = curr.statistics?.blockErrors ?? 0

      const errors = attackErrors + serveErrors + receiveErrors + setErrors + digErrors + blockErrors

      return acc + errors
    }, 0),
  }))

  const errorsChartData = events.map(event => {
    return {
      date: format(event.date, DATE_ISO_FORMAT),
      attack: event.attendees.reduce((acc, stat) => acc + (stat.statistics?.attackErrors ?? 0), 0),
      receive: event.attendees.reduce((acc, stat) => acc + (stat.statistics?.receiveError ?? 0), 0),
    }
  })

  const attackChartData = events.map(event => ({
    date: format(event.date, DATE_ISO_FORMAT),
    attempts: event.attendees.reduce((acc, curr) => acc + (curr.statistics?.attackAttempts ?? 0), 0),
    errors: event.attendees.reduce((acc, curr) => acc + (curr.statistics?.attackErrors ?? 0), 0),
  }))

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
              Kills: {totalKills}, Errors: {totalAttackErrors}, Attempts: {totalAttackAttempts}
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
            <div className="text-2xl font-bold">Efficiency: {totalServeEfficiency}</div>
            <p className="text-xs text-muted-foreground">
              Aces: {totalAces}, Errors: {totalServeErrors}, Attempts: {totalServeAttempts}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <LineChartScore chartData={scoresChartData} />
        <StackedBarChartErrors chartData={errorsChartData} />
        <BarChartMultiple chartData={attackChartData} />
        <Leaderboard
          columns={columns}
          data={top5Players}
        />
      </div>
    </>
  )
}

type EventWithDate = EventWithRelations & { date: Date }

const calculateGamesOverview = (events: Event[]) => {
  let wins = 0
  let loses = 0

  events.forEach(event => {
    if (!event.teamScore || !event.opponentScore) return

    if (event.teamScore > event.opponentScore) {
      wins++
    } else {
      loses++
    }
  })

  const winPercentage = events.length > 0 ? Math.ceil((wins / events.length) * 10000) / 100 : 0
  const totalGames = events.length

  return {
    wins,
    loses,
    winPercentage,
    totalGames,
  }
}

const calculateTotalStatistics = (statistics: StatisticsAggregate) => {
  const totalKills = statistics.kills ?? 0
  const totalAttackErrors = statistics.attackErrors ?? 0
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

  const totalAttackEfficiency = round2DecimalPlaces((totalKills - totalAttackErrors) / totalAttackAttempts, 2)

  const totalReceivePercentage = round2DecimalPlaces(
    (totalReceivePerfect * 3 + totalReceivePositive * 2 + totalReceiveNegative) / totalReceiveAttempts,
    2,
  )

  const totalServeEfficiency = round2DecimalPlaces((totalAces - totalServeErrors) / totalServeAttempts, 2)

  return {
    totalKills,
    totalAttackErrors,
    totalAttackAttempts,
    totalAttackEfficiency,
    totalDigs,
    totalBlocks,
    totalReceivePercentage,
    totalAces,
    totalServeErrors,
    totalServeAttempts,
    totalServeEfficiency,
  }
}

type StatisticsAggregate = NonNullable<Awaited<ReturnType<typeof prisma.statistics.aggregate>>["_sum"]>
