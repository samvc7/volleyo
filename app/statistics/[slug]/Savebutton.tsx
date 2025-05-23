"use client"

import { ButtonWithLoading } from "@/components/ui/custom/ButtonWithLoading"
import { ConfirmDataLossDialog } from "./ConfirmDataLossDialog"
import { useStatistics } from "./StatisticsProvider"
import { useTransition } from "react"
import { saveStatistics } from "./actions"
import { Statistics } from "./columns"
import { toast } from "@/hooks/use-toast"

export const SaveButton = ({ gameId }: { gameId: string }) => {
  const { statistics, hasUnsavedChanges, setHasUnsavedChanges, isFileImported, setIsFileImported } =
    useStatistics<Statistics>()
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveStatistics(statistics, gameId, isFileImported)
        setHasUnsavedChanges(false)
        setIsFileImported(false)
        toast({ title: "Successfully saved statistics" })
      } catch (error) {
        console.error(error)
        toast({ title: "Could not save statistics. Please try again" })
      }
    })
  }

  return hasUnsavedChanges ? (
    isFileImported ? (
      <ConfirmDataLossDialog onConfirmAction={handleSave}>
        <ButtonWithLoading
          label="Save"
          loadingLabel={"Saving..."}
          disabled={isPending}
        />
      </ConfirmDataLossDialog>
    ) : (
      <ButtonWithLoading
        label="Save"
        loadingLabel={"Saving..."}
        disabled={isPending}
        onClick={handleSave}
      />
    )
  ) : null
}
