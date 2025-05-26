import { Button } from "@/components/ui/button"

type SplitCounterButtonProps = {
  value: number
  onIncrement: () => void
  disabledIncrement?: boolean
  onDecrement: () => void
  disabledDecrement?: boolean
  label: string
}

export function SplitCounterButton({
  value,
  onIncrement,
  disabledIncrement = false,
  onDecrement,
  disabledDecrement = false,
  label,
}: SplitCounterButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-medium">{label}</span>
      <div className="inline-flex rounded-md shadow-sm border border-input">
        <Button
          variant="ghost"
          className="rounded-none px-3"
          onClick={onDecrement}
          disabled={disabledDecrement}
        >
          –
        </Button>
        <Button
          variant="ghost"
          className="rounded-none px-3"
          onClick={onIncrement}
          disabled={disabledIncrement}
        >
          <div className="flex items-center justify-center text-sm pr-4">{value}</div>
          <span>+</span>
        </Button>
      </div>
    </div>
  )
}
