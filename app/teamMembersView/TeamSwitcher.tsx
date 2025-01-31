"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
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
import { CommandEmpty } from "cmdk"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { useState } from "react"
import { Team } from "../page"

type TeamSwitcherProps = {
  teams: Team[]
  className?: string
}

export const TeamSwitcher = ({ teams, className }: TeamSwitcherProps) => {
  const [open, setOpen] = useState(false)
  const teamList = parseTeams(teams)
  const [selectedTeam, setSelectedTeam] = useState<SelectTeam>(teamList[0])
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)

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
            {selectedTeam ? selectedTeam.label : "Select Team"}
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
                    key={team.value}
                    onSelect={() => {
                      setSelectedTeam(team)
                      setOpen(false)
                    }}
                  >
                    {team.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedTeam?.value === team.value ? "opacity-100" : "opacity-0",
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
  value: string
  label: string
}

const parseTeams = (teams: Team[]): SelectTeam[] => {
  return teams.map(team => ({ value: team.id, label: team.name }))
}
