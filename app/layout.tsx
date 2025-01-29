import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "../lib/utils"
import "./globals.css"
import { MainNav } from "./MainNav"

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
        <MainNav />

        {children}
      </body>
    </html>
  )
}
