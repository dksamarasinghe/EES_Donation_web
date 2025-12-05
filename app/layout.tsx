import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: 'EES Society - University of Sri Jayewardenepura',
    description: 'Official website of the Electronic and Embedded System Society at the University of Sri Jayewardenepura. Join us to innovate, build, and contribute through charity and projects.',
    keywords: ['EES Society', 'Electronics', 'Embedded Systems', 'USJ', 'Sri Lanka', 'Engineering'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Header />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    )
}
