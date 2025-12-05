'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

interface Program {
    id: string
    title: string
}

export default function EditExpensePage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fetchingExpense, setFetchingExpense] = useState(true)
    const [programs, setPrograms] = useState<Program[]>([])

    const [formData, setFormData] = useState({
        program_id: '',
        description: '',
        amount: '',
        expense_date: '',
        invoice_url: '',
    })

    useEffect(() => {
        fetchPrograms()
        if (id) {
            fetchExpense()
        }
    }, [id])

    async function fetchPrograms() {
        const { data } = await supabase
            .from('programs')
            .select('id, title')
            .eq('category', 'charity')

        setPrograms(data || [])
    }

    async function fetchExpense() {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            alert('Expense not found')
            router.push('/admin/expenses')
            return
        }

        setFormData({
            program_id: data.program_id,
            description: data.description,
            amount: data.amount.toString(),
            expense_date: data.expense_date,
            invoice_url: data.invoice_url || '',
        })
        setFetchingExpense(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error: updateError } = await supabase
            .from('expenses')
            .update({
                program_id: formData.program_id,
                description: formData.description,
                amount: parseFloat(formData.amount),
                expense_date: formData.expense_date,
                invoice_url: formData.invoice_url || null,
            })
            .eq('id', id)

        if (updateError) {
            setError('Failed to update expense: ' + updateError.message)
            setLoading(false)
            return
        }

        alert('Expense updated successfully!')
        router.push('/admin/expenses')
    }

    if (fetchingExpense) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className={styles.editExpensePage}>
            <h1>Edit Expense</h1>

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className="form-group">
                    <label htmlFor="program_id" className="form-label">Charity Program *</label>
                    <select
                        id="program_id"
                        className="form-select"
                        value={formData.program_id}
                        onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                        required
                    >
                        <option value="">-- Select Program --</option>
                        {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="form-label">Description *</label>
                    <textarea
                        id="description"
                        className="form-textarea"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="amount" className="form-label">Amount (LKR) *</label>
                    <input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="expense_date" className="form-label">Expense Date *</label>
                    <input
                        id="expense_date"
                        type="date"
                        className="form-input"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="invoice_url" className="form-label">Invoice/Bill URL (Optional)</label>
                    <input
                        id="invoice_url"
                        type="url"
                        className="form-input"
                        placeholder="https://..."
                        value={formData.invoice_url}
                        onChange={(e) => setFormData({ ...formData, invoice_url: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Expense'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => router.push('/admin/expenses')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
