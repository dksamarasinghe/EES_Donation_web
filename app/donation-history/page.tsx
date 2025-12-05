'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DonationItem {
    goods_items: {
        name: string
    }
    quantity: string
}

interface Donation {
    id: string
    donor_name: string
    donor_contact: string
    amount: number | null
    donation_date: string
    donation_type: 'money' | 'goods'
    donation_items?: DonationItem[]
    programs: {
        title: string
    }
    donation_categories: {
        name: string
    }
}

export default function DonationHistoryPage() {
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDonations()
    }, [])

    async function fetchDonations() {
        setLoading(true)

        const { data, error } = await supabase
            .from('donations')
            .select(`
                *,
                programs (
                    title
                ),
                donation_categories (
                    name
                ),
                donation_items (
                    quantity,
                    goods_items (
                        name
                    )
                )
            `)
            .eq('status', 'Received')
            .order('donation_date', { ascending: false })

        if (error) {
            console.error('Error fetching donations:', error)
            setLoading(false)
            return
        }

        setDonations(data || [])
        setLoading(false)
    }

    function formatGoodsDescription(donation: Donation) {
        if (!donation.donation_items || donation.donation_items.length === 0) {
            return 'No items'
        }

        return donation.donation_items
            .map(item => `${item.goods_items.name} - ${item.quantity}`)
            .join(', ')
    }

    const moneyDonations = donations.filter(d => d.donation_type === 'money')
    const goodsDonations = donations.filter(d => d.donation_type === 'goods')
    const totalMoney = moneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

    return (
        <div className={styles.historyPage}>
            <div className={styles.header}>
                <h1>Donation History</h1>
                <p className={styles.subtitle}>
                    View all donations made to our charity programs and see the impact of your contributions
                </p>
            </div>

            {/* Statistics */}
            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <h3>{moneyDonations.length}</h3>
                    <p>Money Donations</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📦</div>
                    <h3>{goodsDonations.length}</h3>
                    <p>Goods Donations</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎯</div>
                    <h3>{formatCurrency(totalMoney)}</h3>
                    <p>Total Money Raised</p>
                </div>
            </div>

            {/* Donations Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className="spinner"></div>
                    </div>
                ) : donations.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No donations yet. Be the first to contribute!</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Donor Name</th>
                                <th>Type</th>
                                <th>Amount / Description</th>
                                <th>Program</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donations.map((donation) => (
                                <tr key={donation.id}>
                                    <td>{donation.donor_name}</td>
                                    <td>
                                        <span className={`badge ${donation.donation_type === 'money' ? 'badge-success' : 'badge-warning'}`}>
                                            {donation.donation_type === 'money' ? '💰 Money' : '📦 Goods'}
                                        </span>
                                    </td>
                                    <td>
                                        {donation.donation_type === 'money' ? (
                                            <span className={styles.amount}>
                                                {formatCurrency(donation.amount || 0)}
                                            </span>
                                        ) : (
                                            <span className={styles.goodsDesc}>
                                                {formatGoodsDescription(donation)}
                                            </span>
                                        )}
                                    </td>
                                    <td>{donation.programs.title}</td>
                                    <td>
                                        <span className="badge badge-info">
                                            {donation.donation_type === 'money' ? 'Money Donation' : donation.donation_categories.name}
                                        </span>
                                    </td>
                                    <td>{formatDate(donation.donation_date)}</td>
                                    <td className={styles.contact}>{donation.donor_contact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
