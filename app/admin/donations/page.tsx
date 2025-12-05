'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import styles from './page.module.css'

interface Donation {
    id: string
    donor_name: string
    donor_contact: string
    donor_address: string
    donation_type: 'money' | 'goods'
    amount: number | null
    status: 'Pending' | 'Received'
    donation_date: string
    programs: {
        title: string
    }
    donation_categories: {
        name: string
    } | null
}

export default function ManageDonationsPage() {
    const router = useRouter()
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchDonations()
    }, [filterStatus])

    async function fetchDonations() {
        setLoading(true)

        let query = supabase
            .from('donations')
            .select(`
                *,
                programs (title),
                donation_categories (name)
            `)
            .order('donation_date', { ascending: false })

        if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching donations:', error)
            setLoading(false)
            return
        }

        setDonations(data || [])
        setLoading(false)
    }

    async function updateStatus(donationId: string, newStatus: 'Pending' | 'Received') {
        setUpdating(donationId)

        const { error } = await supabase
            .from('donations')
            .update({ status: newStatus })
            .eq('id', donationId)

        if (error) {
            alert('Failed to update status')
            console.error(error)
            setUpdating(null)
            return
        }

        // Update local state
        setDonations(donations.map(d =>
            d.id === donationId ? { ...d, status: newStatus } : d
        ))
        setUpdating(null)
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'Pending':
                return 'badge-warning'
            case 'Received':
                return 'badge-success'
            default:
                return 'badge-secondary'
        }
    }

    function getTypeBadge(type: string) {
        return type === 'money' ? 'badge-info' : 'badge-primary'
    }

    const stats = {
        all: donations.length,
        pending: donations.filter(d => d.status === 'Pending').length,
        received: donations.filter(d => d.status === 'Received').length
    }

    return (
        <div className={styles.donationsPage}>
            <div className={styles.header}>
                <h1>Manage Donations</h1>
                <p className={styles.subtitle}>Track and manage all donations (money & goods)</p>
            </div>

            <div className={styles.filters}>
                <button
                    className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All ({stats.all})
                </button>
                <button
                    className={`btn ${filterStatus === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilterStatus('Pending')}
                >
                    Pending ({stats.pending})
                </button>
                <button
                    className={`btn ${filterStatus === 'Received' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilterStatus('Received')}
                >
                    Received ({stats.received})
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                </div>
            ) : donations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No donations found</p>
                </div>
            ) : (
                <div className={styles.donationsList}>
                    {donations.map((donation) => (
                        <div key={donation.id} className="card" style={{ marginBottom: '1.5rem' }}>
                            <div className={styles.donationCard}>
                                <div className={styles.donationHeader}>
                                    <div>
                                        <h3>{donation.donor_name}</h3>
                                        <p className={styles.program}>{donation.programs.title}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span className={`badge ${getTypeBadge(donation.donation_type)}`}>
                                            {donation.donation_type.toUpperCase()}
                                        </span>
                                        <span className={`badge ${getStatusBadge(donation.status)}`}>
                                            {donation.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.donationDetails}>
                                    {donation.donation_type === 'money' ? (
                                        <div className={styles.detailRow}>
                                            <strong>Amount:</strong>
                                            <span className={styles.amount}>
                                                {formatCurrency(donation.amount || 0)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={styles.detailRow}>
                                            <strong>Category:</strong>
                                            <span className="badge badge-info">
                                                {donation.donation_categories?.name || 'N/A'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.detailRow}>
                                        <strong>Date:</strong>
                                        <span>{formatDate(donation.donation_date)}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <strong>Contact:</strong>
                                        <span>{donation.donor_contact}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <strong>Address:</strong>
                                        <span>{donation.donor_address}</span>
                                    </div>
                                </div>

                                <div className={styles.statusActions}>
                                    <label>Update Status:</label>
                                    <div className={styles.statusButtons}>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => updateStatus(donation.id, 'Pending')}
                                            disabled={updating === donation.id || donation.status === 'Pending'}
                                        >
                                            Pending
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => updateStatus(donation.id, 'Received')}
                                            disabled={updating === donation.id || donation.status === 'Received'}
                                        >
                                            Mark as Received
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
