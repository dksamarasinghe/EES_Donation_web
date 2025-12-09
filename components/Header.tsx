'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        checkAdminStatus()
    }, [])

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && isMenuOpen) {
                const target = event.target as HTMLElement
                // Don't close if clicking the toggle button
                if (!target.closest(`.${styles.menuToggle}`)) {
                    setIsMenuOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

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

    const closeMenu = () => setIsMenuOpen(false)

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

                {/* Desktop Nav */}
                <nav className={styles.nav}>
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

            {/* Mobile Overlay */}
            {isMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

            {/* Mobile Side Drawer */}
            <div ref={menuRef} className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileMenuHeader}>
                    <h3>Menu</h3>
                    <button
                        className={styles.closeBtn}
                        onClick={closeMenu}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>
                <nav className={styles.mobileNav}>
                    <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>Home</Link>
                    <Link href="/programs" className={styles.mobileNavLink} onClick={closeMenu}>Programs</Link>
                    <Link href="/donation-history" className={styles.mobileNavLink} onClick={closeMenu}>Donation History</Link>
                    <Link href="/expenses" className={styles.mobileNavLink} onClick={closeMenu}>Expenses</Link>
                    <Link href="/team" className={styles.mobileNavLink} onClick={closeMenu}>Team</Link>
                    <Link href="/donate" className={styles.mobileDonateBtn} onClick={closeMenu}>Donate Now</Link>
                </nav>
            </div>
        </header>
    )
}
