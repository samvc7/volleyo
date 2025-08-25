"use client"

import { ReactNode, useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
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
import { createTeam } from "./team-switcher/actions"
import { useRouter } from "next/navigation"

type CreateTeamDialogProps = {
  children?: ReactNode
}

export const CreateTeamDialog = ({ children }: CreateTeamDialogProps) => {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      const createdTeam = await createTeam(formData)
      setShow(false)
      router.push(`/${createdTeam.slug}/events`)
    } catch (error) {
      console.error(error)
      return "Could not create new team. Please try again."
    }

    return null
  }, null)

  return (
    <Dialog
      open={show}
      onOpenChange={setShow}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

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
              onClick={() => setShow(false)}
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
