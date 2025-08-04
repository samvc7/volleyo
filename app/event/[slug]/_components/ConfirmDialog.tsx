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
import { useState } from "react"

type ConfirmDialogProps = {
  onConfirmAction: () => void
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
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
