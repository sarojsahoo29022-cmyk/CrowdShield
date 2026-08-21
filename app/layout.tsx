import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { OperatorProvider } from '@/lib/operator-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrowdShield — Crowd Safety Command Center',
  description:
    'AI-powered crowd safety and event management command center for police, security teams, and control-room operators.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b1220',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className="dark bg-background"
    >
      <body className="antialiased font-sans">
        <AuthProvider>
          <OperatorProvider>{children}</OperatorProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
