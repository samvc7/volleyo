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
import { useState, useTransition } from "react"
import { ButtonWithLoading } from "./ButtonWithLoading"

type ConfirmDialogProps = {
  onConfirmAction: () => Promise<void>
  title: string
  description: string | JSX.Element
  confirmText?: string
  cancelText?: string
  children: React.ReactNode
}

export const ConfirmDialog = ({
  onConfirmAction,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  children,
}: ConfirmDialogProps) => {
  const [showDialog, setShowDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      setShowDialog(false)
      await onConfirmAction()
    })
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
          >
            {cancelText}
          </Button>
          <ButtonWithLoading
            label={confirmText}
            loadingLabel="Loading..."
            disabled={isPending}
            onClick={handleConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
