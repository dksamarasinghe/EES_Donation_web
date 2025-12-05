'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { supabase } from '@/lib/supabase'

interface Program {
    id: string
    title: string
}

interface DonationCategory {
    id: string
    name: string
}

interface GoodsItem {
    id: string
    name: string
}

interface SelectedItem {
    item_id: string
    item_name: string
    quantity: string
}

type DonationType = 'money' | 'goods'

export default function DonatePage() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [categories, setCategories] = useState<DonationCategory[]>([])
    const [availableItems, setAvailableItems] = useState<GoodsItem[]>([])
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [donationType, setDonationType] = useState<DonationType>('money')

    const [formData, setFormData] = useState({
        donor_name: '',
        donor_address: '',
        donor_contact: '',
        program_id: '',
        category_id: '',
        amount: '',
    })

    useEffect(() => {
        fetchCharityPrograms()
    }, [])

    useEffect(() => {
        if (formData.program_id) {
            fetchCategories(formData.program_id)
        } else {
            setCategories([])
            setFormData(prev => ({ ...prev, category_id: '' }))
        }
    }, [formData.program_id])

    useEffect(() => {
        if (formData.category_id && donationType === 'goods') {
            fetchGoodsItems(formData.category_id)
        } else {
            setAvailableItems([])
            setSelectedItems([])
        }
    }, [formData.category_id, donationType])

    async function fetchCharityPrograms() {
        const { data, error } = await supabase
            .from('programs')
            .select('id, title')
            .eq('category', 'charity')
            .eq('status', 'published')
            .order('date', { ascending: false })

        if (error) {
            console.error('Error fetching programs:', error)
            return
        }

        setPrograms(data || [])
    }

    async function fetchCategories(programId: string) {
        const { data, error } = await supabase
            .from('donation_categories')
            .select('*')
            .eq('program_id', programId)

        if (error) {
            console.error('Error fetching categories:', error)
            return
        }

        setCategories(data || [])
        if (data && data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: data[0].id }))
        }
    }

    async function fetchGoodsItems(categoryId: string) {
        const { data, error } = await supabase
            .from('goods_items')
            .select('id, name')
            .eq('category_id', categoryId)
            .order('name')

        if (error) {
            console.error('Error fetching goods items:', error)
            return
        }

        setAvailableItems(data || [])
    }

    function handleItemToggle(item: GoodsItem, checked: boolean) {
        if (checked) {
            setSelectedItems([...selectedItems, {
                item_id: item.id,
                item_name: item.name,
                quantity: ''
            }])
        } else {
            setSelectedItems(selectedItems.filter(i => i.item_id !== item.id))
        }
    }

    function handleQuantityChange(itemId: string, quantity: string) {
        setSelectedItems(selectedItems.map(item =>
            item.item_id === itemId ? { ...item, quantity } : item
        ))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        if (!formData.donor_name || !formData.donor_address || !formData.donor_contact) {
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        if (!formData.program_id) {
            setError('Please select a program')
            setLoading(false)
            return
        }

        if (donationType === 'goods' && !formData.category_id) {
            setError('Please select a category for goods donation')
            setLoading(false)
            return
        }

        if (donationType === 'money') {
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                setError('Please enter a valid donation amount')
                setLoading(false)
                return
            }
        } else {
            if (selectedItems.length === 0) {
                setError('Please select at least one item to donate')
                setLoading(false)
                return
            }

            const itemsWithoutQty = selectedItems.filter(item => !item.quantity.trim())
            if (itemsWithoutQty.length > 0) {
                setError('Please enter quantity for all selected items')
                setLoading(false)
                return
            }
        }

        // Create donation with Pending status
        const donationData: {
            donor_name: string
            donor_address: string
            donor_contact: string
            program_id: string
            category_id: string
            donation_type: 'money' | 'goods'
            amount: number | null
            status: string
        } = {
            donor_name: formData.donor_name,
            donor_address: formData.donor_address,
            donor_contact: formData.donor_contact,
            program_id: formData.program_id,
            category_id: formData.category_id,
            donation_type: donationType,
            amount: donationType === 'money' ? parseFloat(formData.amount) : null,
            status: 'Pending'
        }

        const { data: donation, error: donationError } = await supabase
            .from('donations')
            .insert([donationData])
            .select()
            .single()

        if (donationError) {
            setError('Failed to submit donation. Please try again.')
            console.error('Error submitting donation:', donationError)
            setLoading(false)
            return
        }

        // If goods donation, insert items
        if (donationType === 'goods' && donation) {
            const donationItems = selectedItems.map(item => ({
                donation_id: donation.id,
                goods_item_id: item.item_id,
                quantity: item.quantity
            }))

            const { error: itemsError } = await supabase
                .from('donation_items')
                .insert(donationItems)

            if (itemsError) {
                console.error('Error inserting donation items:', itemsError)
            }
        }

        setSuccess(true)
        setLoading(false)

        // Reset form
        setFormData({
            donor_name: '',
            donor_address: '',
            donor_contact: '',
            program_id: '',
            category_id: '',
            amount: '',
        })
        setSelectedItems([])
        setDonationType('money')

        setTimeout(() => {
            setSuccess(false)
        }, 5000)
    }

    if (success) {
        return (
            <div className={styles.donatePage}>
                <div className={styles.header}>
                    <h1>Thank You!</h1>
                    <p className={styles.subtitle}>
                        Your {donationType === 'money' ? 'donation' : 'contribution'} has been submitted successfully
                    </p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                    <h2>Donation Submitted</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
                        {donationType === 'money'
                            ? 'Your generous contribution will be reviewed and processed soon. Thank you for making a difference!'
                            : 'Thank you for your generous in-kind donation. We will review and confirm receipt soon.'}
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setSuccess(false)}
                        style={{ marginTop: '2rem' }}
                    >
                        Make Another Donation
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.donatePage}>
            <div className={styles.header}>
                <h1>Make a Donation</h1>
                <p className={styles.subtitle}>
                    Your contribution helps us make a real difference in our community through charity programs
                </p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    {/* Donation Type Selector */}
                    <div className="form-group">
                        <label className="form-label">Donation Type *</label>
                        <div className={styles.donationType}>
                            <button
                                type="button"
                                className={`${styles.typeBtn} ${donationType === 'money' ? styles.typeBtnActive : ''}`}
                                onClick={() => setDonationType('money')}
                            >
                                💰 Money
                            </button>
                            <button
                                type="button"
                                className={`${styles.typeBtn} ${donationType === 'goods' ? styles.typeBtnActive : ''}`}
                                onClick={() => setDonationType('goods')}
                            >
                                📦 Goods (In-Kind)
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="donor_name" className="form-label">Full Name *</label>
                        <input
                            id="donor_name"
                            type="text"
                            className="form-input"
                            value={formData.donor_name}
                            onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="donor_address" className="form-label">Address *</label>
                        <textarea
                            id="donor_address"
                            className="form-textarea"
                            rows={3}
                            value={formData.donor_address}
                            onChange={(e) => setFormData({ ...formData, donor_address: e.target.value })}
                            required
                            placeholder="123 Main Street, Colombo"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="donor_contact" className="form-label">Contact Number *</label>
                        <input
                            id="donor_contact"
                            type="tel"
                            className="form-input"
                            value={formData.donor_contact}
                            onChange={(e) => setFormData({ ...formData, donor_contact: e.target.value })}
                            required
                            placeholder="+94 71 234 5678"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="program_id" className="form-label">Select Charity Program *</label>
                        <select
                            id="program_id"
                            className="form-select"
                            value={formData.program_id}
                            onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                            required
                        >
                            <option value="">-- Select a program --</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.program_id && categories.length > 0 && donationType === 'goods' && (
                        <div className="form-group">
                            <label htmlFor="category_id" className="form-label">Donation Category *</label>
                            <select
                                id="category_id"
                                className="form-select"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                required
                            >
                                <option value="">-- Select a category --</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {donationType === 'money' ? (
                        <div className="form-group">
                            <label htmlFor="amount" className="form-label">Donation Amount (LKR) *</label>
                            <input
                                id="amount"
                                type="number"
                                min="1"
                                step="0.01"
                                className="form-input"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                placeholder="1000.00"
                            />
                        </div>
                    ) : (
                        <>
                            {availableItems.length > 0 ? (
                                <div className="form-group">
                                    <label className="form-label">Select Items to Donate *</label>
                                    <div className={styles.itemsGrid}>
                                        {availableItems.map(item => {
                                            const isSelected = selectedItems.some(i => i.item_id === item.id)
                                            const selectedItem = selectedItems.find(i => i.item_id === item.id)

                                            return (
                                                <div key={item.id} className={styles.itemCard}>
                                                    <label className={styles.itemCheckbox}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleItemToggle(item, e.target.checked)}
                                                        />
                                                        <span>{item.name}</span>
                                                    </label>
                                                    {isSelected && (
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Enter quantity"
                                                            value={selectedItem?.quantity || ''}
                                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--color-text-muted)', padding: '1rem', textAlign: 'center' }}>
                                    {formData.category_id
                                        ? 'No items available for this category yet.'
                                        : 'Select a category to see available items.'}
                                </p>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {loading ? 'Submitting...' : 'Submit Donation'}
                    </button>
                </form>
            </div>
        </div>
    )
}
