import { ElementType, ReactNode } from "react"

type NoneFoundProps = {
  title: string
  description: string
  icon?: ElementType
  children?: ReactNode
}

export const NoneFound = ({ title, description, icon: Icon, children }: NoneFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-6">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground max-w-md mt-2 mb-6">{description}</p>
      {children}
    </div>
  )
}
