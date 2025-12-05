'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

interface GoodsItem {
    id: string
    name: string
    category: string
}

interface Requirement {
    id: string
    goods_item_id: string
    required_quantity: string
    goods_items: {
        name: string
        donation_categories: {
            name: string
        }
    }
}

export default function ProgramRequirementsPage() {
    const params = useParams()
    const router = useRouter()
    const programId = params.id as string

    const [programTitle, setProgramTitle] = useState('')
    const [availableItems, setAvailableItems] = useState<GoodsItem[]>([])
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState('')
    const [quantity, setQuantity] = useState('')

    useEffect(() => {
        if (programId) {
            fetchProgramDetails()
            fetchAvailableItems()
            fetchRequirements()
        }
    }, [programId])

    async function fetchProgramDetails() {
        const { data } = await supabase
            .from('programs')
            .select('title')
            .eq('id', programId)
            .single()

        setProgramTitle(data?.title || '')
    }

    async function fetchAvailableItems() {
        const { data } = await supabase
            .from('goods_items')
            .select(`
        id,
        name,
        donation_categories (name)
      `)
            .order('name')

        const items = data?.map(item => ({
            id: item.id,
            name: item.name,
            category: item.donation_categories?.name || ''
        })) || []

        setAvailableItems(items)
    }

    async function fetchRequirements() {
        const { data, error } = await supabase
            .from('program_goods_requirements')
            .select(`
        *,
        goods_items (
          name,
          donation_categories (name)
        )
      `)
            .eq('program_id', programId)

        if (error) {
            console.error('Error fetching requirements:', error)
            setLoading(false)
            return
        }

        setRequirements(data || [])
        setLoading(false)
    }

    async function handleAddRequirement(e: React.FormEvent) {
        e.preventDefault()

        if (!selectedItem || !quantity.trim()) {
            alert('Please select an item and enter required quantity')
            return
        }

        const { error } = await supabase
            .from('program_goods_requirements')
            .insert([{
                program_id: programId,
                goods_item_id: selectedItem,
                required_quantity: quantity.trim()
            }])

        if (error) {
            alert('Failed to add requirement: ' + error.message)
            return
        }

        setSelectedItem('')
        setQuantity('')
        fetchRequirements()
    }

    async function handleDelete(reqId: string) {
        if (!confirm('Remove this requirement?')) {
            return
        }

        const { error } = await supabase
            .from('program_goods_requirements')
            .delete()
            .eq('id', reqId)

        if (error) {
            alert('Failed to delete: ' + error.message)
            return
        }

        fetchRequirements()
    }

    return (
        <div className={styles.page}>
            <button
                className="btn btn-outline"
                onClick={() => router.push('/admin/programs')}
                style={{ marginBottom: '1rem' }}
            >
                ← Back to Programs
            </button>

            <h1>Goods Requirements</h1>
            <p className={styles.subtitle}>Set required items and quantities for: <strong>{programTitle}</strong></p>

            {/* Add Requirement */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Add Item Requirement</h2>
                <form onSubmit={handleAddRequirement} style={{ display: 'grid', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Select Item *</label>
                        <select
                            className="form-select"
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            required
                        >
                            <option value="">-- Select an item --</option>
                            {availableItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Required Quantity *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., 100, 10 kg, 50 units"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                        <small style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                            Enter the quantity needed for this program
                        </small>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        + Add Requirement
                    </button>
                </form>
            </div>

            {/* Requirements List */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem' }}>Current Requirements</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : requirements.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                        No requirements set yet. Add items above.
                    </p>
                ) : (
                    <div className={styles.requirementsList}>
                        {requirements.map(req => (
                            <div key={req.id} className={styles.requirementCard}>
                                <div className={styles.reqInfo}>
                                    <h3>{req.goods_items.name}</h3>
                                    <span className="badge badge-info">{req.goods_items.donation_categories.name}</span>
                                </div>
                                <div className={styles.reqQuantity}>
                                    <strong>Required:</strong> {req.required_quantity}
                                </div>
                                <button
                                    className="btn btn-outline"
                                    style={{ color: 'var(--color-accent-red)' }}
                                    onClick={() => handleDelete(req.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
