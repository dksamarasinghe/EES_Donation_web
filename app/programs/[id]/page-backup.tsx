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

        // Fetch donation and expense stats for charity programs
        const programsWithStats = await Promise.all(
            data.map(async (program) => {
                if (program.category === 'charity') {
                    const { data: statsData } = await supabase
                        .from('charity_programs_stats')
                        .select('*')
                        .eq('id', program.id)
                        .single()

                    return {
                        ...program,
                        amount_raised: statsData?.amount_raised || 0,
                        total_expenses: statsData?.total_expenses || 0,
                        amount_remaining: statsData?.amount_remaining || program.total_cost || 0,
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
