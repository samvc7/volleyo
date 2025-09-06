"use client"

import { useActionState, useState, useTransition } from "react"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { connectUserWithTeamMember, createTeam, updateLastSelectedTeam } from "./actions"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { useSession } from "next-auth/react"

type SuggestedTeamsWithMember = {
  teamId: string
  team: { name: string; slug: string }
  memberId: string
}

type TeamSwitcherProps = {
  teams: Team[]
  selectedTeam?: Team
  suggestedTeamsWithMember?: SuggestedTeamsWithMember[]
  className?: string
}

export const TeamSwitcher = ({
  teams,
  selectedTeam,
  suggestedTeamsWithMember,
  className,
}: TeamSwitcherProps) => {
  const router = useRouter()
  const session = useSession()
  const [open, setOpen] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [selectedTeamToJoin, setSelectedTeamToJoin] = useState<SuggestedTeamsWithMember | undefined>()

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

  const [isPeningJoinTeam, startJoiningTeamTransition] = useTransition()

  const onJoinTeam = () => {
    startJoiningTeamTransition(async () => {
      if (!selectedTeamToJoin || !session.data?.user.id) return
      await connectUserWithTeamMember(session.data.user.id, selectedTeamToJoin.memberId)
      setSelectedTeamToJoin(undefined)
      router.push(`/${selectedTeamToJoin.team.slug}/events`)
    })
  }

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

  // Not using the CreateTeamDialog component because of the complexity with the popover and command component
  return (
    <>
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

              {suggestedTeamsWithMember && suggestedTeamsWithMember.length > 0 && (
                <CommandGroup heading="Suggested Teams to Join">
                  {suggestedTeamsWithMember.map(teamMember => {
                    return (
                      <CommandItem
                        key={teamMember.teamId}
                        onSelect={() => {
                          setOpen(false)
                          setSelectedTeamToJoin(teamMember)
                        }}
                      >
                        {teamMember.team.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>

            <CommandSeparator />

            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setShowNewTeamDialog(true)
                  }}
                >
                  <PlusCircle className="h-5 w-5" />
                  Create Team
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog
        open={showNewTeamDialog}
        onOpenChange={setShowNewTeamDialog}
      >
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

      <Dialog
        open={!!selectedTeamToJoin}
        onOpenChange={open => {
          if (!open) setSelectedTeamToJoin(undefined)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join team</DialogTitle>
            <DialogDescription>
              {selectedTeamToJoin
                ? `We found "${selectedTeamToJoin.team.name}" already list your email. Do you want to join?`
                : null}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedTeamToJoin(undefined)}
            >
              Not now
            </Button>
            <ButtonWithLoading
              label="Join"
              loadingLabel="Joining..."
              disabled={isPeningJoinTeam}
              type="submit"
              onClick={onJoinTeam}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
