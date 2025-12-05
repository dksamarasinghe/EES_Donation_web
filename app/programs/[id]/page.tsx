'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Program {
    id: string
    title: string
    description: string
    category: string
    date: string
    location: string
    funding_goal: number | null
    status: string
}

interface ProgramImage {
    id: string
    image_url: string
}

interface DonationStats {
    total_raised: number
    donation_count: number
    goods_count?: number
}

interface GoodsProgress {
    item_id: string
    item_name: string
    required: string
    collected: string
    percentage: number
}

export default function ProgramDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [program, setProgram] = useState<Program | null>(null)
    const [images, setImages] = useState<ProgramImage[]>([])
    const [donationStats, setDonationStats] = useState<DonationStats | null>(null)
    const [goodsProgress, setGoodsProgress] = useState<GoodsProgress[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchProgramDetails()
            fetchGoodsProgress()
        }
    }, [id])

    async function fetchProgramDetails() {
        setLoading(true)

        const { data: programData, error: programError } = await supabase
            .from('programs')
            .select('*')
            .eq('id', id)
            .single()

        if (programError) {
            console.error('Error fetching program:', programError)
            setLoading(false)
            return
        }

        setProgram(programData)

        const { data: imagesData } = await supabase
            .from('program_images')
            .select('*')
            .eq('program_id', id)
            .order('created_at')

        setImages(imagesData || [])

        // Fetch donation stats for charity programs - ONLY RECEIVED DONATIONS
        if (programData?.category === 'charity') {
            // Get all money donations to calculate total raised - only Received donations
            const { data: moneyDonations } = await supabase
                .from('donations')
                .select('amount')
                .eq('program_id', id)
                .eq('donation_type', 'money')
                .eq('status', 'Received')

            const totalRaised = moneyDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

            // Get money donation count - only Received donations
            const { count: moneyCount } = await supabase
                .from('donations')
                .select('*', { count: 'exact', head: true })
                .eq('program_id', id)
                .eq('donation_type', 'money')
                .eq('status', 'Received')

            // Get goods donation count - only Received donations
            const { count: goodsCount } = await supabase
                .from('donations')
                .select('*', { count: 'exact', head: true })
                .eq('program_id', id)
                .eq('donation_type', 'goods')
                .eq('status', 'Received')

            setDonationStats({
                total_raised: totalRaised,
                donation_count: moneyCount || 0,
                goods_count: goodsCount || 0
            })
        }

        setLoading(false)
    }

    async function fetchGoodsProgress() {
        const { data: categories } = await supabase
            .from('donation_categories')
            .select('id')
            .eq('program_id', id)

        if (!categories || categories.length === 0) return

        const categoryIds = categories.map(c => c.id)

        const { data: requiredItems } = await supabase
            .from('goods_items')
            .select('id, name, required_quantity')
            .in('category_id', categoryIds)

        if (!requiredItems) return

        const progress: GoodsProgress[] = []

        for (const item of requiredItems) {
            const { data: donatedItems } = await supabase
                .from('donation_items')
                .select(`
          quantity,
          donations!inner(program_id, status)
        `)
                .eq('goods_item_id', item.id)
                .eq('donations.program_id', id)
                .eq('donations.status', 'Received')

            let totalCollected = 0
            donatedItems?.forEach(di => {
                const qty = parseInt(di.quantity) || 0
                totalCollected += qty
            })

            const requiredQty = parseInt(item.required_quantity) || 0
            const percentage = requiredQty > 0 ? Math.min((totalCollected / requiredQty) * 100, 100) : 0

            progress.push({
                item_id: item.id,
                item_name: item.name,
                required: item.required_quantity,
                collected: totalCollected.toString(),
                percentage: Math.round(percentage)
            })
        }

        setGoodsProgress(progress)
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (!program) {
        return (
            <div className={styles.notFound}>
                <h1>Program Not Found</h1>
                <button className="btn btn-primary" onClick={() => router.push('/programs')}>
                    Back to Programs
                </button>
            </div>
        )
    }

    const progressPercentage = program.funding_goal
        ? Math.min((donationStats?.total_raised || 0) / program.funding_goal * 100, 100)
        : 0

    return (
        <div className={styles.programDetail}>
            <div className={styles.container}>
                <button className="btn btn-outline" onClick={() => router.back()} style={{ marginBottom: '2rem' }}>
                    ← Back
                </button>

                <div className={styles.content}>
                    <div className={styles.mainContent}>
                        <div className={styles.imageGallery}>
                            {images.length > 0 ? (
                                <img src={images[0].image_url} alt={program.title} className={styles.mainImage} />
                            ) : (
                                <div className={styles.imagePlaceholder}>No image available</div>
                            )}
                        </div>

                        <div className={styles.details}>
                            <h1>{program.title}</h1>
                            <p className={styles.description}>{program.description}</p>

                            {/* Gallery Section */}
                            {images.length > 1 && (
                                <div className={styles.gallery}>
                                    <h2>Gallery</h2>
                                    <div className={styles.galleryGrid}>
                                        {images.slice(1).map((image) => (
                                            <img
                                                key={image.id}
                                                src={image.image_url}
                                                alt="Program gallery"
                                                className={styles.galleryImage}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {program.category === 'charity' && (
                        <div className={styles.sidebar}>
                            {/* Program Info Card */}
                            <div className="card" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Program Details</h3>
                                <div className={styles.programInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>📅</span>
                                        <div>
                                            <div className={styles.infoLabel}>Date</div>
                                            <div className={styles.infoValue}>{formatDate(program.date)}</div>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>📍</span>
                                        <div>
                                            <div className={styles.infoLabel}>Location</div>
                                            <div className={styles.infoValue}>{program.location}</div>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>📂</span>
                                        <div>
                                            <div className={styles.infoLabel}>Category</div>
                                            <div className={styles.infoValue}>{program.category}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Donation Progress */}
                            <div className="card">
                                <h3 style={{ marginBottom: '1.5rem' }}>Donation Progress</h3>

                                {/* Progress bar */}
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                {/* Raised and Goal boxes */}
                                <div className={styles.amountBoxes}>
                                    <div className={styles.amountBox}>
                                        <div className={styles.boxLabel}>Raised</div>
                                        <div className={styles.boxAmount}>{formatCurrency(donationStats?.total_raised || 0)}</div>
                                    </div>
                                    <div className={styles.amountBox}>
                                        <div className={styles.boxLabel}>Goal</div>
                                        <div className={styles.boxAmount}>{formatCurrency(program.funding_goal || 0)}</div>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className={styles.statsRow}>
                                    <span>{donationStats?.donation_count || 0} money donations</span>
                                    <span>{donationStats?.goods_count || 0} goods donations</span>
                                    <span>{Math.round(progressPercentage)}% funded</span>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                    onClick={() => router.push('/donate')}
                                >
                                    Donate to this program
                                </button>
                            </div>

                            {/* Goods Donations */}
                            {goodsProgress.length > 0 && (
                                <div className="card" style={{ marginTop: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem' }}>📦 Goods Donations</h3>
                                    {goodsProgress.map(item => (
                                        <div key={item.item_id} className={styles.goodsItem}>
                                            <div className={styles.goodsHeader}>
                                                <span className={styles.goodsName}>{item.item_name}</span>
                                                <span className={styles.goodsCount}>
                                                    {item.collected}/{item.required}
                                                </span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${item.percentage}%`, backgroundColor: 'var(--color-accent-red)' }}
                                                />
                                            </div>
                                            <div className={styles.goodsPercentage}>
                                                {item.percentage}% collected
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
