import * as React from "react"
import { Overview } from "./overview/Overview"

export default async function Teams({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { from, to } = await searchParams
  const fromDate = new Date(from as string)
  const toDate = new Date(to as string)

  return (
    <Overview
      teamSlug={slug}
      fromDateFilter={fromDate}
      toDateFilter={toDate}
    />
  )
}
