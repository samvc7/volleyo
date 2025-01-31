"use client"

import { useState } from "react"
import { GameDayCard } from "./GameDayCard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export const GamesView = () => {
  const [showNewGamedialog, setShowNewGameDialog] = useState(false)

  return (
    <Dialog
      open={showNewGamedialog}
      onOpenChange={setShowNewGameDialog}
    >
      <DialogTrigger
        className="flex"
        asChild
      >
        <Button
          variant={"outline"}
          aria-expanded={showNewGamedialog}
          aria-label="Create Game"
          onClick={() => {
            setShowNewGameDialog(true)
          }}
          className="ml-auto"
        >
          <PlusCircle className="h-5 w-5" />
          Create Game
        </Button>
      </DialogTrigger>
      <ul className="w-full flex flex-col gap-4 mt-4">
        {games.map(game => (
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Game</DialogTitle>
          <DialogDescription>
            Add a new tournament, single game, training, tuneup etc. to manage statistics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Title</Label>
            <Input id="name" />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowNewGameDialog(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type Games = {
  id: number
  title: string
  date: Date
  address?: string
  participants?: string[]
}

const games: Games[] = [
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
