'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function ManageExpensesPage() {
    const router = useRouter()
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [programs, setPrograms] = useState<any[]>([])

    const [formData, setFormData] = useState({
        program_id: '',
        description: '',
        amount: '',
        expense_date: '',
        invoice_url: '',
    })

    useEffect(() => {
        fetchExpenses()
        fetchPrograms()
    }, [])

    async function fetchPrograms() {
        const { data } = await supabase
            .from('programs')
            .select('id, title')
            .eq('category', 'charity')

        setPrograms(data || [])
    }

    async function fetchExpenses() {
        setLoading(true)
        const { data } = await supabase
            .from('expenses')
            .select(`
        *,
        programs (title)
      `)
            .order('expense_date', { ascending: false })

        setExpenses(data || [])
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const { error } = await supabase
            .from('expenses')
            .insert([{
                program_id: formData.program_id,
                description: formData.description,
                amount: parseFloat(formData.amount),
                expense_date: formData.expense_date,
                invoice_url: formData.invoice_url || null,
            }])

        if (error) {
            alert('Failed to add expense: ' + error.message)
            return
        }

        alert('Expense added successfully!')
        setFormData({
            program_id: '',
            description: '',
            amount: '',
            expense_date: '',
            invoice_url: '',
        })
        setShowForm(false)
        fetchExpenses()
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return
        }

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Failed to delete expense: ' + error.message)
            return
        }

        alert('Expense deleted successfully!')
        fetchExpenses()
    }

    return (
        <div className={styles.managePage}>
            <div className={styles.header}>
                <h1>Manage Expenses</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add New Expense'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Add New Expense</h2>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Charity Program *</label>
                            <select
                                className="form-select"
                                value={formData.program_id}
                                onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                                required
                            >
                                <option value="">-- Select Program --</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>{program.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount (LKR) *</label>
                            <input
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
                            <label className="form-label">Expense Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.expense_date}
                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Invoice/Bill URL (Optional)</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://..."
                                value={formData.invoice_url}
                                onChange={(e) => setFormData({ ...formData, invoice_url: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">Add Expense</button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>
                    <div className="spinner"></div>
                </div>
            ) : expenses.length === 0 ? (
                <div className={styles.empty}>
                    <p>No expenses recorded yet.</p>
                </div>
            ) : (
                <div className={styles.expensesList}>
                    {expenses.map((expense) => (
                        <div key={expense.id} className={styles.expenseCard}>
                            <div className={styles.expenseInfo}>
                                <h3>{expense.description}</h3>
                                <div className={styles.metadata}>
                                    <span className="badge badge-info">{expense.programs.title}</span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(expense.expense_date).toLocaleDateString()}
                                    </span>
                                    <span style={{ color: 'var(--color-accent-blue', fontSize: '1.125rem', fontWeight: '600' }}>
                                        LKR {expense.amount.toLocaleString()}
                                    </span>
                                </div>
                                {expense.invoice_url && (
                                    <a href={expense.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-blue)', fontSize: '0.875rem' }}>
                                        📄 View Invoice
                                    </a>
                                )}
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => router.push(`/admin/expenses/edit/${expense.id}`)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ color: 'var(--color-accent-red)', borderColor: 'var(--color-accent-red)' }}
                                    onClick={() => handleDelete(expense.id)}
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
