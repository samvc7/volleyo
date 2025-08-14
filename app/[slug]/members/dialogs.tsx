"use client"

import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { createMember, editMember } from "./actions"
import { ReactNode, useActionState, useState } from "react"
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Member } from "@prisma/client"
import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"

export const AddTeamMemberDialog = () => {
  const { slug } = useParams() as { slug: string }
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const createMemberWithTeamSlug = createMember.bind(null, slug)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      await createMemberWithTeamSlug(formData)
      setShowDialog(false)
      toast({ title: "Team member added successfully" })
    } catch (error) {
      console.error(error)
      toast({
        title: "Could not add new team member. Please try again.",
        description: (error as Error).message,
      })
    }

    return null
  }, null)

  return (
    <Dialog
      open={showDialog}
      onOpenChange={setShowDialog}
    >
      <DialogTrigger
        className="flex"
        asChild
      >
        <Button
          className="h-10"
          variant={"outline"}
          size="sm"
          aria-expanded={showDialog}
          aria-label="Add Member"
          onClick={() => {
            setShowDialog(true)
          }}
        >
          <PlusCircle className="h-5 w-5" />
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Add a team member for your team.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickName">Nick Name</Label>
              <Input
                id="nickName"
                name="nickName"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
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

export const EditTeamMemberDialog = ({ member, children }: { member: Member; children: ReactNode }) => {
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const editMemberWithId = editMember.bind(null, member.id)
  const [, formAction, isPending] = useActionState<null | string, FormData>(async (_, formData) => {
    try {
      await editMemberWithId(formData)
      setShowDialog(false)
      toast({ title: "Team members information updated" })
    } catch (error) {
      console.error(error)
      return "Could not update team members information. Please try again"
    }

    return null
  }, null)

  return (
    <Dialog
      open={showDialog}
      onOpenChange={setShowDialog}
    >
      <DialogTrigger
        className="flex"
        asChild
      >
        {children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>Edit team members information.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={member.firstName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={member.lastName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickName">Nick Name</Label>
              <Input
                id="nickName"
                name="nickName"
                defaultValue={member.nickName ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={member.email ?? undefined}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>

            <ButtonWithLoading
              label="Save"
              loadingLabel="Editing..."
              disabled={isPending}
              type="submit"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
