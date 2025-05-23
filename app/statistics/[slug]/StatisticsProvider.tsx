"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

type StatisticsContextType<TData> = {
  statistics: TData[]
  setStatistics: Dispatch<SetStateAction<TData[]>>
}

const StatisticsContext = createContext<StatisticsContextType<any> | null>(null)

type StatisticsProviderProps<TData> = {
  initialData: TData[]
  children: ReactNode
}

export const StatisticsProvider = <TData,>({ initialData, children }: StatisticsProviderProps<TData>) => {
  const [statistics, setStatistics] = useState<TData[]>(initialData)

  useEffect(() => {
    setStatistics(initialData)
  }, [initialData])

  return (
    <StatisticsContext.Provider value={{ statistics, setStatistics }}>{children}</StatisticsContext.Provider>
  )
}

export const useStatistics = <TData,>(): StatisticsContextType<TData> => {
  const context = useContext(StatisticsContext)
  if (!context) {
    throw new Error("useStatistics must be used within a StatisticsProvider")
  }
  return context
}
