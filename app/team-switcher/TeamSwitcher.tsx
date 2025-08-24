"use client"

import { useActionState, useState } from "react"
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
import { createTeam, updateLastSelectedTeam } from "./actions"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { useSession } from "next-auth/react"

type TeamSwitcherProps = {
  teams: Team[]
  selectedTeam?: Team
  className?: string
}

export const TeamSwitcher = ({ teams, selectedTeam, className }: TeamSwitcherProps) => {
  const router = useRouter()
  const session = useSession()
  const [open, setOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      const createdTeam = await createTeam(formData)
      setShowNewTeamDialog(false)
      router.push(`/${createdTeam.slug}/events`)
    } catch (error) {
      console.error(error)
      return "Could not create new team. Please try again."
    }

    return null
  }, null)

  const teamList = parseTeams(teams)
  const selectedTeamParsed = selectedTeam ? parseTeam(selectedTeam) : undefined

  const handleSelectTeam = async (team: Team) => {
    if (session.data?.user.id) {
      await updateLastSelectedTeam(team.id, session.data?.user.id)
    } else {
      console.warn("User session not found, skipping last selected team update.")
    }
    setOpen(false)
    router.push(`/${team.slug}/events`)
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
        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                name="name"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTeamDialog(false)}
            >
              Cancel
            </Button>
            <ButtonWithLoading
              label="Create"
              loadingLabel="Creating..."
              disabled={isPending}
              type="submit"
            />
          </DialogFooter>
        </form>
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
