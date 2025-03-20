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
    const parsedData = data
      .filter(row => {
        const name = trimQuotes(row["Name"])
        return !!name && !name.includes("total")
      })
      .map((row, ix) => {
        return {
          id: ix.toString(),
          name: trimQuotes(row["Name"]),
          kills: convertToNumber(row["Attack K"]),
          attackErrors: convertToNumber(row["Attack E"]),
          attackAttempts: convertToNumber(row["Attack TA"]),
          attackEfficiency: convertToNumber(row["Attack Atk%"]),
          killsPerSet: convertToNumber(row["Attack K/S"]),
          serveAces: convertToNumber(row["Serve SA"]),
          serveErrors: convertToNumber(row["Serve SE"]),
          serveAttempts: convertToNumber(row["Serve TA"]),
          servePercentage: convertToNumber(row["Serve Pct"]),
          serveEfficiency: convertToNumber(row["Serve Eff"]),
          serveRating: convertToNumber(row["Serve Rtg."]),
          receivePerfect: convertToNumber(row["Receive 3"]),
          receivePositive: convertToNumber(row["Receive 2"]),
          receiveNegative: convertToNumber(row["Receive 1"]),
          receiveError: convertToNumber(row["Receive 0"]),
          receiveAttempts: convertToNumber(row["Receive TA"]),
          receivePercentage: convertToNumber(trimQuotes(row["Receive Pass%"])),
          setAssists: convertToNumber(row["Set Ast"]),
          setsTotal: convertToNumber(row["Set TA"]),
          setErrors: convertToNumber(row["Set SE"]),
          digs: convertToNumber(row["Dig DS"]),
          digErrors: convertToNumber(row["Dig DE"]),
          blockSingle: convertToNumber(row["Block BS"]),
          blockMultiple: convertToNumber(row["Block BA"]),
          blockErrors: convertToNumber(row["Block BE"]),
          blocksPerSet: convertToNumber(row["Block B/S"]),
          setsPlayed: convertToNumber(row["Sets Sets Played"]),
        } as TData
      })
    return parsedData
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

const trimQuotes = (value: string) => {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1)
  }
  return value
}

const convertToNumber = (value: string) => {
  return value ? Number(value) : undefined
}
