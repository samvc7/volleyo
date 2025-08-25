import { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "../lib/utils"
import "./globals.css"
import { MainNav } from "./nav/MainNav"
import { Toaster } from "@/components/ui/toaster"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Volleyo",
  description: "Volleyo is a platform for volleyball players.",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <Providers>
          <MainNav />
          <main className="container flex flex-col max-w-screen-2xl my-5 gap-4">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
