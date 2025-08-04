"use client"

import { ReactNode, useState } from "react"
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

type ConfirmDataLossDialogProps = {
  onConfirmAction: () => void
  children: ReactNode
}

export const ConfirmDataLossDialog = ({ onConfirmAction, children }: ConfirmDataLossDialogProps) => {
  const [showDialog, setShowDialog] = useState(false)

  const handleConfirm = () => {
    setShowDialog(false)
    onConfirmAction()
  }

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
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>All current statistics data will be lost.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
