import * as React from "react"
import { GameDayCard } from "./GameDayCard"
import { TeamSwitcher } from "./TeamSwitcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMembersView } from "./TeamMembersView"
import { Overview } from "./Overview"

export default function Home() {
  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <Tabs defaultValue="games">
        <div className="space-x-4">
          <TeamSwitcher teams={teams} />
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="team-members">Team Members</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          <Overview />
        </TabsContent>

        <TabsContent value="games">
          <ul className="w-full flex flex-col gap-4 mt-4">
            {data.map(game => (
              <GameDayCard
                id={game.id}
                key={game.id}
                title={game.title}
                date={game.date}
                address={game.address}
                participants={game.participants}
              />
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="team-members">
          <TeamMembersView />
        </TabsContent>
      </Tabs>
    </main>
  )
}

const data = [
  {
    id: 1,
    title: "Tournament X",
    date: new Date(),
    address: "Somewhere 1234",
    participants: ["Kevin", "John", "Lisa", "Richard"],
  },
  {
    id: 2,
    title: "Tournament Y",
    date: new Date(),
    address: "Somewhere 1234",
    participants: ["Steven", "Karl", "Jennie", "Pauline"],
  },
  {
    id: 3,
    title: "Tuneup 1",
    date: new Date(),
    address: "Somewhere 1234",
    participants: ["Tom", "Jerry", "Mickey", "Donald"],
  },
  {
    id: 4,
    title: "Training 1",
    date: new Date(),
    address: "Somewhere 1234",
    participants: ["Mickey", "Minnie", "Goofy", "Pluto"],
  },
]

export type Team = {
  id: string
  name: string
}

const teams: Team[] = [
  { id: "team-a", name: "Team A" },
  { id: "team-b", name: "Team B" },
  { id: "team-c", name: "Team C" },
  { id: "team-d", name: "Team D" },
]
