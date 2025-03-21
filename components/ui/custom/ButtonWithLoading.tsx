import { Loader2 } from "lucide-react"
import { Button } from "../button"
import { ComponentProps } from "react"

type ButtonWithLoadingProps = ComponentProps<typeof Button> & {
  label: string
  loadingLabel?: string
}

export const ButtonWithLoading = ({ label, loadingLabel, ...props }: ButtonWithLoadingProps) => {
  return (
    <Button {...props}>
      {props.disabled ? (
        <>
          <Loader2 className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  )
}
