import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { TimerProvider } from "@/contexts/timer-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
})

export const metadata: Metadata = {
  title: "StudyHub Elite - AI-Powered Learning Platform",
  description: "Transform your study experience with AI-powered tools, collaborative features, and advanced analytics.",
  keywords: "study, learning, AI, flashcards, quiz, education",
  authors: [{ name: "StudyHub Elite Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <TimerProvider>
          {children}
          <Toaster />
        </TimerProvider>
      </body>
    </html>
  )
}
