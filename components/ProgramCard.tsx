import Image from 'next/image'
import Link from 'next/link'
import styles from './ProgramCard.module.css'
import { ProgramWithStats } from '@/lib/types'
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils'

interface ProgramCardProps {
    program: ProgramWithStats
}

export default function ProgramCard({ program }: ProgramCardProps) {
    const isCharity = program.category === 'charity'
    const mainImage = program.program_images[0]?.image_url || '/images/placeholder.jpg'

    const amountRaised = program.amount_raised || 0
    const totalCost = program.total_cost || 0
    const percentage = isCharity ? calculatePercentage(amountRaised, totalCost) : 0

    return (
        <Link href={`/programs/${program.id}`} className={styles.cardLink}>
            <div className={styles.card}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={mainImage}
                        alt={program.title}
                        width={400}
                        height={250}
                        className={styles.image}
                    />
                    <div className={styles.categoryBadge}>
                        {program.category}
                    </div>
                </div>

                <div className={styles.content}>
                    <h3 className={styles.title}>{program.title}</h3>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(program.date)}
                        </div>
                        {program.location && (
                            <div className={styles.metaItem}>
                                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {program.location}
                            </div>
                        )}
                    </div>

                    <p className={styles.description}>
                        {program.description.substring(0, 120)}...
                    </p>

                    {isCharity && totalCost > 0 && (
                        <div className={styles.charitySection}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <div className={styles.charityStats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Raised</span>
                                    <span className={styles.statValue}>{formatCurrency(amountRaised)}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Goal</span>
                                    <span className={styles.statValue}>{formatCurrency(totalCost)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.viewMore}>
                        Click to view details →
                    </div>
                </div>
            </div>
        </Link>
    )
}
