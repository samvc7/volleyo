import * as React from "react"
import { Overview } from "./overview/Overview"

export default async function Teams({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <Overview />
}
