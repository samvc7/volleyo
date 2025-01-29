import * as React from "react"
import { GameDayCard } from "./GameDayCard"
import { TeamSwitcher } from "./TeamSwitcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col pt-5 gap-4">
      <Tabs defaultValue="games">
        <div className="space-x-4">
          <TeamSwitcher />
          <TabsList>
            <div className="flex items-center gap-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="games">Games </TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
            </div>
          </TabsList>
        </div>
        <TabsContent value="overview">Coming Soon</TabsContent>

        <TabsContent value="games">
          <ul className="w-full flex flex-col gap-4">
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

        <TabsContent value="players">Coming Soon</TabsContent>
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
