'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPrograms: 0,
        totalDonations: 0,
        totalExpenses: 0,
        totalAmountRaised: 0,
    })

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        const [programs, donations, expenses] = await Promise.all([
            supabase.from('programs').select('*', { count: 'exact', head: true }),
            supabase.from('donations').select('amount'),
            supabase.from('expenses').select('amount'),
        ])

        const totalAmountRaised = donations.data?.reduce((sum, d) => sum + d.amount, 0) || 0
        const totalExpensesAmount = expenses.data?.reduce((sum, e) => sum + e.amount, 0) || 0

        setStats({
            totalPrograms: programs.count || 0,
            totalDonations: donations.data?.length || 0,
            totalExpenses: expenses.data?.length || 0,
            totalAmountRaised,
        })
    }

    return (
        <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-text-primary)' }}>
                Dashboard
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <h3>Total Programs</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1rem 0' }}>{stats.totalPrograms}</p>
                </div>

                <div className="card">
                    <h3>Total Donations</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1rem 0' }}>{stats.totalDonations}</p>
                </div>

                <div className="card">
                    <h3>Amount Raised</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1rem 0' }}>
                        LKR {stats.totalAmountRaised.toFixed(0)}
                    </p>
                </div>

                <div className="card">
                    <h3>Total Expenses</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1rem 0' }}>{stats.totalExpenses}</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <a href="/admin/programs/new" className="btn btn-primary">Create New Program</a>
                    <a href="/admin/expenses" className="btn btn-secondary">Add Expense</a>
                    <a href="/donation-history" className="btn btn-outline">View Donations</a>
                </div>
            </div>
        </div>
    )
}
