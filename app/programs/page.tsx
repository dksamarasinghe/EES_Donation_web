'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { supabase } from '@/lib/supabase'
import { ProgramWithStats } from '@/lib/types'
import ProgramCard from '@/components/ProgramCard'

type CategoryFilter = 'all' | 'event' | 'project' | 'charity'

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<ProgramWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<CategoryFilter>('all')

    useEffect(() => {
        fetchPrograms()
    }, [filter])

    async function fetchPrograms() {
        setLoading(true)

        let query = supabase
            .from('programs')
            .select(`
        *,
        program_images (
          id,
          image_url,
          display_order
        ),
        donation_categories (
          id,
          name
        )
      `)
            .eq('status', 'published')
            .order('date', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('category', filter)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching programs:', error)
            setLoading(false)
            return
        }

        // Fetch donation and expense stats for charity programs - only count Received donations
        const programsWithStats = await Promise.all(
            data.map(async (program) => {
                if (program.category === 'charity') {
                    // Calculate amount raised from Received donations only
                    const { data: moneyDonations } = await supabase
                        .from('donations')
                        .select('amount')
                        .eq('program_id', program.id)
                        .eq('donation_type', 'money')
                        .eq('status', 'Received')

                    const amount_raised = moneyDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

                    // Get total expenses
                    const { data: expensesData } = await supabase
                        .from('expenses')
                        .select('amount')
                        .eq('program_id', program.id)

                    const total_expenses = expensesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

                    return {
                        ...program,
                        amount_raised,
                        total_expenses,
                        amount_remaining: (program.total_cost || 0) - total_expenses,
                    }
                }
                return program
            })
        )

        setPrograms(programsWithStats)
        setLoading(false)
    }

    return (
        <div className={styles.programsPage}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Our Programs</h1>
                    <p className={styles.subtitle}>
                        Explore our events, projects, and charity initiatives making a difference in the community
                    </p>
                </div>

                <div className={styles.filters}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Programs
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'event' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('event')}
                    >
                        Events
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'project' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('project')}
                    >
                        Projects
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'charity' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('charity')}
                    >
                        Charity Programs
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className="spinner"></div>
                    </div>
                ) : programs.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No programs found in this category.</p>
                    </div>
                ) : (
                    <div className={styles.programsGrid}>
                        {programs.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
