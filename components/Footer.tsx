import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>EES Society</h3>
                        <p className={styles.description}>
                            The official society for Electronic and Embedded System enthusiasts at the University of Sri Jayewardenepura.
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>Quick Links</h3>
                        <ul className={styles.linkList}>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/programs">Programs</Link></li>
                            <li><Link href="/donate">Donate</Link></li>
                            <li><Link href="/team">Team</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>Get Involved</h3>
                        <ul className={styles.linkList}>
                            <li><Link href="/donation-history">Donation History</Link></li>
                            <li><Link href="/expenses">Expenses</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>Contact</h3>
                        <p className={styles.contactInfo}>
                            University of Sri Jayewardenepura<br />
                            Gangodawila, Nugegoda<br />
                            Sri Lanka
                        </p>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} EES Society. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
