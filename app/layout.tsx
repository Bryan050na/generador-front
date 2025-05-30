import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diagramainador',
  description: 'Generador de código y diagramas',
  generator: 'Diagramainador',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
