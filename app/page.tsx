import * as React from "react"
import { GamesView } from "./games/GamesView"
import { TeamSwitcher } from "./teamMembersView/TeamSwitcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMembersView } from "./teamMembersView/TeamMembersView"
import { Overview } from "./overview/Overview"
import { DatePickerWithRange } from "./DateRangePicker"

export default function Home() {
  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <Tabs defaultValue="overview">
        <div className="flex gap-4">
          <TeamSwitcher teams={teams} />
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="team-members">Team Members</TabsTrigger>
          </TabsList>
          <DatePickerWithRange className="ml-auto" />
        </div>
        <TabsContent
          value="overview"
          className="space-y-4"
        >
          <Overview />
        </TabsContent>

        <TabsContent value="games">
          <GamesView />
        </TabsContent>

        <TabsContent value="team-members">
          <TeamMembersView />
        </TabsContent>
      </Tabs>
    </main>
  )
}

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
