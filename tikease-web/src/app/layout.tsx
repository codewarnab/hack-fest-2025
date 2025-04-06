import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/ThemeProvider"
import CookieConsent from "@/components/cookie-consent"
import AnalyticsProvider from "@/components/analytics-provider"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "EventTix - Book Event Tickets",
  description: "Book tickets for upcoming events, conferences, and more",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}  font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AnalyticsProvider>
            {children}
            <CookieConsent />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

