'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './layout.module.css'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    const isLoginPage = pathname === '/admin/login'

    useEffect(() => {
        if (!isLoginPage) {
            checkAdminAccess()
        } else {
            setLoading(false)
        }
    }, [isLoginPage])

    async function checkAdminAccess() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/admin/login')
            return
        }

        const { data: userData } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!userData?.is_admin) {
            router.push('/')
            return
        }

        setIsAdmin(true)
        setLoading(false)
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (isLoginPage) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Admin Panel</h2>
                <nav className={styles.nav}>
                    <Link href="/admin" className={pathname === '/admin' ? styles.active : ''}>
                        Dashboard
                    </Link>
                    <Link href="/admin/programs" className={pathname === '/admin/programs' ? styles.active : ''}>
                        Manage Programs
                    </Link>
                    <Link href="/admin/programs/new" className={pathname === '/admin/programs/new' ? styles.active : ''}>
                        + Create Program
                    </Link>
                    <Link href="/admin/categories" className={pathname === '/admin/categories' ? styles.active : ''}>
                        Donation Categories
                    </Link>
                    <Link href="/admin/expenses" className={pathname === '/admin/expenses' ? styles.active : ''}>
                        Manage Expenses
                    </Link>
                    <Link href="/admin/donations" className={pathname.startsWith('/admin/donations') ? styles.active : ''}>
                        Manage Donations
                    </Link>
                    <Link href="/admin/team" className={pathname === '/admin/team' ? styles.active : ''}>
                        Manage Team
                    </Link>
                    <button onClick={handleSignOut} className={styles.signOutBtn}>
                        Sign Out
                    </button>
                </nav>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
