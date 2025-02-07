"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Team } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

type TeamSwitcherProps = {
  teams: Team[]
  selectedTeam: Team
  className?: string
}

export const TeamSwitcher = ({ teams, selectedTeam, className }: TeamSwitcherProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const teamList = parseTeams(teams)
  const selectedTeamParsed = parseTeam(selectedTeam)

  const handleSelectTeam = (team: Team) => {
    setOpen(false)
    router.push(`/${team.slug}`)
  }

  return (
    <Dialog
      open={showNewTeamDialog}
      onOpenChange={setShowNewTeamDialog}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select Team"
            className={cn("w-[200px] justify-between", className)}
          >
            {selectedTeamParsed ? selectedTeamParsed.label : "Select Team"}
            <ChevronsUpDown className="ml-auto opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search team..." />
            <CommandList>
              <CommandEmpty>No teams found.</CommandEmpty>
              <CommandGroup>
                {teamList.map(team => (
                  <CommandItem
                    key={team.value.id}
                    onSelect={() => handleSelectTeam(team.value)}
                  >
                    {team.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedTeam?.id === team.value.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>

            <CommandSeparator />

            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewTeamDialog(true)
                    }}
                  >
                    <PlusCircle className="h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>Add a new team to manage statistics and players.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input id="name" />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowNewTeamDialog(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type SelectTeam = {
  value: Team
  label: string
}

const parseTeams = (teams: Team[]): SelectTeam[] => {
  return teams.map(team => parseTeam(team))
}

const parseTeam = (team: Team): SelectTeam => {
  return { value: team, label: team.name }
}
