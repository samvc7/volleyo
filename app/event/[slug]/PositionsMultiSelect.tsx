import { Position } from "@prisma/client"
import { positionShortLabels } from "./columns/utils"
import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select"

export const PositionsMultiSelect = (props: Partial<MultiSelectProps>) => {
  const { options, onValueChange = () => {}, onSelectionDone, ...restProps } = props

  const positionsSelect = Object.values(Position).map(p => ({
    value: p,
    label: positionShortLabels[p],
  }))

  return (
    <MultiSelect
      id="positions"
      name="positions"
      options={positionsSelect}
      placeholder="Select positions"
      onValueChange={onValueChange}
      onSelectionDone={onSelectionDone}
      className="min-w-64"
      {...restProps}
    />
  )
}
