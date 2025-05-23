"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

type StatisticsContextType<TData> = {
  statistics: TData[]
  setStatistics: Dispatch<SetStateAction<TData[]>>
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void
  isFileImported: boolean
  setIsFileImported: (isFileImported: boolean) => void
}

const StatisticsContext = createContext<StatisticsContextType<any> | null>(null)

type StatisticsProviderProps<TData> = {
  initialData: TData[]
  children: ReactNode
}

export const StatisticsProvider = <TData,>({ initialData, children }: StatisticsProviderProps<TData>) => {
  const [statistics, setStatistics] = useState<TData[]>(initialData)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isFileImported, setIsFileImported] = useState(false)

  useEffect(() => {
    setStatistics(initialData)
  }, [initialData])

  return (
    <StatisticsContext.Provider
      value={{
        statistics,
        setStatistics,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        isFileImported,
        setIsFileImported,
      }}
    >
      {children}
    </StatisticsContext.Provider>
  )
}

export const useStatistics = <TData,>(): StatisticsContextType<TData> => {
  const context = useContext(StatisticsContext)
  if (!context) {
    throw new Error("useStatistics must be used within a StatisticsProvider")
  }
  return context
}
