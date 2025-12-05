'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { supabase } from '@/lib/supabase'
import { ExpenseWithProgram } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Image from 'next/image'

interface Program {
    id: string
    title: string
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseWithProgram[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProgram, setSelectedProgram] = useState<string>('all')
    const [programs, setPrograms] = useState<Program[]>([])

    useEffect(() => {
        fetchPrograms()
        fetchExpenses()
    }, [])

    useEffect(() => {
        fetchExpenses()
    }, [selectedProgram])

    async function fetchPrograms() {
        const { data } = await supabase
            .from('programs')
            .select('id, title')
            .eq('category', 'charity')
            .eq('status', 'published')

        setPrograms(data || [])
    }

    async function fetchExpenses() {
        setLoading(true)

        let query = supabase
            .from('expenses')
            .select(`
        *,
        programs (
          title
        )
      `)
            .order('expense_date', { ascending: false })

        if (selectedProgram !== 'all') {
            query = query.eq('program_id', selectedProgram)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching expenses:', error)
            setLoading(false)
            return
        }

        setExpenses(data || [])
        setLoading(false)
    }

    return (
        <div className={styles.expensesPage}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Expense Records</h1>
                    <p className={styles.subtitle}>
                        Transparent tracking of all expenses for our charity programs
                    </p>
                </div>

                <div className={styles.filters}>
                    <select
                        className="form-select"
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        style={{ maxWidth: '400px', margin: '0 auto' }}
                    >
                        <option value="all">All Programs</option>
                        {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.title}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className="spinner"></div>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No expenses recorded yet.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.expensesGrid}>
                            {expenses.map((expense) => (
                                <div key={expense.id} className={styles.expenseCard}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.expenseTitle}>{expense.description}</h3>
                                        <span className={styles.programBadge}>
                                            {expense.programs.title}
                                        </span>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.expenseInfo}>
                                            <div className={styles.infoItem}>
                                                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className={styles.amount}>{formatCurrency(expense.amount)}</span>
                                            </div>

                                            <div className={styles.infoItem}>
                                                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{formatDate(expense.expense_date)}</span>
                                            </div>
                                        </div>

                                        {expense.invoice_url && (
                                            <div className={styles.invoice}>
                                                <a
                                                    href={expense.invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.invoiceLink}
                                                >
                                                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    View Invoice/Bill
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.totalCard}>
                            <div className={styles.totalLabel}>Total Expenses</div>
                            <div className={styles.totalAmount}>
                                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
