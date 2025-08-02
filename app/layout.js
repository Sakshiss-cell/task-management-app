import { Inter } from "next/font/google"
import "./globals.css"
import ReduxProvider from "../components/ReduxProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Task Management App",
  description: "A comprehensive task management application built with Next.js and Redux",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
