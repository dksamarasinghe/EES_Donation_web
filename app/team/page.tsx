'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

interface TeamMember {
    id: string
    name: string
    position: string
    display_order: number
    year: string
    image_url?: string | null
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [currentYear, setCurrentYear] = useState('2025/26')

    // Position hierarchy
    const positionLevels = {
        'Senior Treasurer': 1,
        'President': 2,
        'Secretary': 2,
        'Treasurer': 2,
        'Vice President': 2,
        'Vice Secretary': 2,
        'IT Coordinator': 3,
        'Editor': 3,
        'Organizer': 3,
        'Committee Member': 4,
    }

    useEffect(() => {
        fetchTeamMembers()
    }, [])

    async function fetchTeamMembers() {
        const { data } = await supabase
            .from('team_members')
            .select('*')
            .eq('year', currentYear)
            .order('display_order', { ascending: true })

        if (data) {
            setMembers(data)
        }

        setLoading(false)
    }

    function getMembersByLevel(level: number) {
        return members.filter(m => positionLevels[m.position as keyof typeof positionLevels] === level)
    }

    if (loading) {
        return (
            <div className={styles.teamPage}>
                <div className={styles.loading}>
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    const seniorTreasurer = getMembersByLevel(1)[0]
    const executiveBoard = getMembersByLevel(2)
    const coordinators = getMembersByLevel(3)
    const committeeMembers = getMembersByLevel(4)

    return (
        <div className={styles.teamPage}>
            <div className={styles.header}>
                <h1>Our Team</h1>
                <p className={styles.subtitle}>
                    Meet the passionate individuals driving innovation at EES Society
                </p>
            </div>

            <div className={styles.orgChart}>
                {/* Level 1: Senior Treasurer */}
                {seniorTreasurer && (
                    <div className={styles.level1}>
                        <div className={styles.memberNode}>
                            <div className={styles.avatar}>
                                {seniorTreasurer.image_url ? (
                                    <img
                                        src={seniorTreasurer.image_url}
                                        alt={seniorTreasurer.name}
                                        className={styles.avatarImage}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {seniorTreasurer.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.nameTag}>{seniorTreasurer.name}</div>
                            <div className={styles.positionTag}>{seniorTreasurer.position}</div>
                        </div>
                    </div>
                )}

                {/* Connecting line from level 1 to level 2 */}
                {seniorTreasurer && executiveBoard.length > 0 && (
                    <div className={styles.connector}>
                        <div className={styles.verticalLine}></div>
                        <div className={styles.horizontalLine}></div>
                    </div>
                )}

                {/* Level 2: Executive Board */}
                {executiveBoard.length > 0 && (
                    <div className={styles.level2}>
                        {executiveBoard.map((member) => (
                            <div key={member.id} className={styles.memberNode}>
                                <div className={styles.avatar}>
                                    {member.image_url ? (
                                        <img
                                            src={member.image_url}
                                            alt={member.name}
                                            className={styles.avatarImage}
                                        />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.nameTag}>{member.name}</div>
                                <div className={styles.positionTag}>{member.position}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Level 3: Coordinators */}
                {coordinators.length > 0 && (
                    <>
                        <div className={styles.connector}>
                            <div className={styles.verticalLine}></div>
                            <div className={styles.horizontalLine}></div>
                        </div>
                        <div className={styles.level3}>
                            {coordinators.map((member) => (
                                <div key={member.id} className={styles.memberNode}>
                                    <div className={styles.avatar}>
                                        {member.image_url ? (
                                            <img
                                                src={member.image_url}
                                                alt={member.name}
                                                className={styles.avatarImage}
                                            />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.nameTag}>{member.name}</div>
                                    <div className={styles.positionTag}>{member.position}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Level 4: Committee Members */}
                {committeeMembers.length > 0 && (
                    <>
                        <div className={styles.connector}>
                            <div className={styles.verticalLine}></div>
                        </div>
                        <div className={styles.level4}>
                            {committeeMembers.map((member) => (
                                <div key={member.id} className={styles.memberNode}>
                                    <div className={styles.avatar}>
                                        {member.image_url ? (
                                            <img
                                                src={member.image_url}
                                                alt={member.name}
                                                className={styles.avatarImage}
                                            />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.nameTag}>{member.name}</div>
                                    <div className={styles.positionTag}>{member.position}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {members.length === 0 && (
                    <div className={styles.empty}>
                        <p>Team information will be added soon through the admin panel.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
