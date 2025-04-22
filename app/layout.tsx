import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "../lib/utils"
import "./globals.css"
import { MainNav } from "./MainNav"
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
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
