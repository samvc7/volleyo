"use client"

import { ReactNode, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const NewGameDialog = ({ children }: { children: ReactNode }) => {
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
      {children}

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
