import styles from './page.module.css'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Program {
    id: string
    title: string
    description: string
    category: string
    date: string
    location: string
    funding_goal: number | null
    image_url?: string
}

export default async function HomePage() {
    // Fetch recent programs (up to 3)
    const { data: programs } = await supabase
        .from('programs')
        .select(`
      id,
      title,
      description,
      category,
      date,
      location,
      funding_goal,
      program_images(image_url)
    `)
        .eq('status', 'published')
        .order('date', { ascending: false })
        .limit(3)

    const formattedPrograms: Program[] = (programs || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        date: p.date,
        location: p.location,
        funding_goal: p.funding_goal,
        image_url: p.program_images?.[0]?.image_url
    }))

    return (
        <div className={styles.homepage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContainer}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>
                            Society of<br />
                            Electronics &<br />
                            Embedded Systems
                        </h1>
                        <p className={styles.heroDescription}>
                            Join the official society of USJ to innovate, build, and contribute through charity and projects.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/programs" className="btn btn-primary">
                                Explore Programs
                            </Link>
                            <Link href="/donate" className="btn btn-outline">
                                Support Us
                            </Link>
                        </div>
                    </div>

                    <div className={styles.heroImages}>
                        <div className={styles.imageGrid}>
                            <div className={styles.imageCard}>
                                <img src="/images/hero-1.JPG" alt="EES Society Event" className={styles.heroImage} />
                            </div>
                            <div className={styles.imageCard}>
                                <img src="/images/hero-2.JPG" alt="Team Members" className={styles.heroImage} />
                            </div>
                            <div className={styles.imageCard}>
                                <img src="/images/hero-3.JPG" alt="Group Photo" className={styles.heroImage} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.about}>
                <h2 className={styles.sectionTitle}>About EES Society</h2>
                <div className={styles.aboutGrid}>
                    <div className={styles.aboutCard}>
                        <div className={styles.iconWrapper}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3>Our Mission</h3>
                        <p>
                            To foster innovation and technical excellence in electronics and embedded systems among students at the University of Sri Jayewardenepura.
                        </p>
                    </div>

                    <div className={styles.aboutCard}>
                        <div className={styles.iconWrapper}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3>Our Vision</h3>
                        <p>
                            To be the leading student organization driving technological innovation and social impact through electronics and embedded systems.
                        </p>
                    </div>

                    <div className={styles.aboutCard}>
                        <div className={styles.iconWrapper}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3>Our Values</h3>
                        <p>
                            Innovation, collaboration, community service, and continuous learning are at the heart of everything we do.
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className={styles.programs}>
                <div className={styles.programsContainer}>
                    <div className={styles.programsHeader}>
                        <h2 className={styles.sectionTitle}>Our Programs</h2>
                        <p className={styles.programsSubtitle}>
                            Discover the impactful initiatives we&apos;ve undertaken to drive innovation and make a difference in our community
                        </p>
                    </div>

                    <div className={styles.programsGrid}>
                        {formattedPrograms.map((program) => (
                            <Link href={`/programs/${program.id}`} key={program.id} className={styles.programCard}>
                                <div className={styles.programImage}>
                                    {program.image_url ? (
                                        <img src={program.image_url} alt={program.title} />
                                    ) : (
                                        <div className={styles.programImagePlaceholder}>
                                            {program.category === 'charity' ? '❤️' : '🎓'}
                                        </div>
                                    )}
                                    <div className={styles.programCategory}>
                                        {program.category}
                                    </div>
                                </div>
                                <div className={styles.programContent}>
                                    <h3>{program.title}</h3>
                                    <p className={styles.programDescription}>
                                        {program.description.substring(0, 120)}...
                                    </p>
                                    <div className={styles.programMeta}>
                                        <span className={styles.programDate}>
                                            📅 {formatDate(program.date)}
                                        </span>
                                        <span className={styles.programLocation}>
                                            📍 {program.location}
                                        </span>
                                    </div>
                                    {program.funding_goal && (
                                        <div className={styles.programGoal}>
                                            🎯 Goal: {formatCurrency(program.funding_goal)}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className={styles.programsFooter}>
                        <Link href="/programs" className="btn btn-primary">
                            View All Programs
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.stats}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Active Members</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>25+</div>
                        <div className={styles.statLabel}>Projects Completed</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>10+</div>
                        <div className={styles.statLabel}>Charity Programs</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statNumber}>100+</div>
                        <div className={styles.statLabel}>Lives Impacted</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaCard}>
                    <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
                    <p className={styles.ctaDescription}>
                        Support our charity programs and help us bring technology education to those in need.
                    </p>
                    <Link href="/donate" className="btn btn-primary">
                        Donate Now
                    </Link>
                </div>
            </section>
        </div>
    )
}
