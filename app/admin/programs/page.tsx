'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

interface Program {
    id: string
    title: string
    category: string
    status: string
    date: string
    location: string
    description: string
    created_at: string
}

export default function ManageProgramsPage() {
    const router = useRouter()
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchPrograms()
    }, [filter])

    async function fetchPrograms() {
        setLoading(true)

        let query = supabase
            .from('programs')
            .select('*')
            .order('created_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('category', filter)
        }

        const { data } = await query
        setPrograms(data || [])
        setLoading(false)
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all associated images, donation categories, donations, and expenses.`)) {
            return
        }

        const { error } = await supabase
            .from('programs')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Failed to delete program: ' + error.message)
            return
        }

        alert('Program deleted successfully!')
        fetchPrograms()
    }

    return (
        <div className={styles.managePage}>
            <div className={styles.header}>
                <h1>Manage Programs</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => router.push('/admin/programs/new')}
                >
                    + Create New Program
                </button>
            </div>

            <div className={styles.filters}>
                <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilter('all')}
                >
                    All ({programs.length})
                </button>
                <button
                    className={`btn ${filter === 'event' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilter('event')}
                >
                    Events
                </button>
                <button
                    className={`btn ${filter === 'project' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilter('project')}
                >
                    Projects
                </button>
                <button
                    className={`btn ${filter === 'charity' ? 'btn-primary' : 'btn-outline'}`}
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
                    <p>No programs found. Create your first program!</p>
                </div>
            ) : (
                <div className={styles.programsList}>
                    {programs.map((program) => (
                        <div key={program.id} className={styles.programCard}>
                            <div className={styles.programInfo}>
                                <h3>{program.title}</h3>
                                <div className={styles.metadata}>
                                    <span className="badge badge-info">{program.category}</span>
                                    <span className={`badge ${program.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                        {program.status}
                                    </span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(program.date).toLocaleDateString()}
                                    </span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        📍 {program.location}
                                    </span>
                                </div>
                                <p className={styles.description}>{program.description.substring(0, 150)}...</p>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => router.push(`/admin/programs/edit/${program.id}`)}
                                >
                                    Edit
                                </button>
                                {program.category === 'charity' && (
                                    <button
                                        className="btn btn-outline"
                                        style={{ borderColor: 'var(--color-accent-blue)', color: 'var(--color-accent-blue)' }}
                                        onClick={() => router.push(`/admin/programs/${program.id}/requirements`)}
                                    >
                                        Set Requirements
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline"
                                    style={{ color: 'var(--color-accent-red)', borderColor: 'var(--color-accent-red)' }}
                                    onClick={() => handleDelete(program.id, program.title)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
