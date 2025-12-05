'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        checkAdminStatus()
    }, [])

    async function checkAdminStatus() {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: userData } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            setIsAdmin(userData?.is_admin || false)
        }
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <Image
                        src="/images/USJP Logo.png"
                        alt="University of Sri Jayewardenepura Logo"
                        width={50}
                        height={50}
                        className={styles.logo}
                    />
                    <Image
                        src="/images/EES Logo TR white.png"
                        alt="EES Society Logo"
                        width={120}
                        height={50}
                        className={styles.eesLogo}
                    />
                </div>

                <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                    <Link href="/" className={styles.navLink}>Home</Link>
                    <Link href="/programs" className={styles.navLink}>Programs</Link>
                    <Link href="/donation-history" className={styles.navLink}>Donation History</Link>
                    <Link href="/expenses" className={styles.navLink}>Expenses</Link>
                    <Link href="/team" className={styles.navLink}>Team</Link>

                </nav>

                <div className={styles.actions}>
                    <Link href="/donate" className={styles.donateBtn}>
                        Donate Now
                    </Link>

                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    )
}
