"use client"

import { ChangeEvent, FormEvent, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type UploadStatisticsProps<TData> = {
  onUploadData(data: TData[]): void
}

export const UploadStatisticsInput = <TData,>({ onUploadData }: UploadStatisticsProps<TData>) => {
  const [file, setFile] = useState<File>()

  const fileReader = new FileReader()

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0])
    }
  }

  const handleOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (file) {
      fileReader.onload = function (event) {
        if (event.target) {
          const csvOutput = event.target.result as string
          // Split rows
          const rows = csvOutput.split("\n")
          // Extract headers
          const headers = rows[0].split(",")

          // Parse rows into an array of objects
          const data = rows.slice(1).map(row => {
            const values = row.split(",")
            return headers.reduce((acc, header, index) => {
              acc[header.trim()] = values[index]?.trim() || ""
              return acc
            }, {} as Record<string, string>)
          })

          const parsedData = parseDataForTable<TData>(data)
          onUploadData(parsedData)
        }
      }

      fileReader.readAsText(file)
    }
  }

  const parseDataForTable = <TData,>(data: Record<string, string>[]): TData[] => {
    const parsedData = data.map(row => {
      return {
        name: trimQuotes(row["Name"]),
        kills: row["Attack K"],
        attackErrors: row["Attack E"],
        attackAttempts: row["Attack TA"],
        attackEfficiency: row["Attack Atk%"],
        killsPerSet: row["Attack K/S"],
        serveAces: row["Serve SA"],
        serveErrors: row["Serve SE"],
        serveAttempts: row["Serve TA"],
        servePercentage: row["Serve Pct"],
        serveEfficiency: row["Serve Eff"],
        serveRating: row["Serve Rtg."],
        receivePerfect: row["Receive 3"],
        receivePositive: row["Receive 2"],
        receiveNegative: row["Receive 1"],
        receiveError: row["Receive 0"],
        receiveAttempts: row["Receive TA"],
        receivePercentage: trimQuotes(row["Receive Pass%"]),
        setAssists: row["Set Ast"],
        setsTotal: row["Set TA"],
        setErrors: row["Set E"],
        digs: row["Dig DS"],
        digErrors: row["Dig DE"],
        blockSingle: row["Block BS"],
        blockMultiple: row["Block BA"],
        blockErrors: row["Block BE"],
        blocksPerSet: row["Block B/S"],
        setsPlayed: row["Sets Sets Played"],
      } as TData
    })
    return parsedData
  }

  const trimQuotes = (value: string) => {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1)
    }
    return value
  }

  return (
    <form onSubmit={handleOnSubmit}>
      <div className="flex gap-2">
        <Input
          id="statistics"
          name="statistics"
          type="file"
          accept=".csv"
          required
          onChange={handleOnChange}
        />
        {file ? <Button type="submit">Upload</Button> : null}
      </div>
    </form>
  )
}
