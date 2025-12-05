'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/utils'
import styles from './page.module.css'

interface TeamMember {
    id: string
    name: string
    position: string
    year: string
    display_order: number
    image_url: string | null
}

export default function ManageTeamPage() {
    const router = useRouter()
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        position: '',
        year: '2025/26',
        display_order: 0,
        image_url: '',
    })

    useEffect(() => {
        fetchMembers()
    }, [])

    async function fetchMembers() {
        setLoading(true)
        const { data } = await supabase
            .from('team_members')
            .select('*')
            .order('year', { ascending: false })
            .order('display_order', { ascending: true })

        setMembers(data || [])
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        let imageUrl = formData.image_url

        // Upload image if a new one is selected
        if (selectedImage) {
            try {
                imageUrl = await uploadImage('team-photos', selectedImage)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                alert('Failed to upload image: ' + errorMessage)
                return
            }
        }

        if (editingId) {
            // Update existing member
            const { error } = await supabase
                .from('team_members')
                .update({
                    name: formData.name,
                    position: formData.position,
                    year: formData.year,
                    display_order: parseInt(formData.display_order.toString()),
                    image_url: imageUrl || null,
                })
                .eq('id', editingId)

            if (error) {
                alert('Failed to update member: ' + error.message)
                return
            }
            alert('Team member updated successfully!')
        } else {
            // Insert new member
            const { error } = await supabase
                .from('team_members')
                .insert([{
                    name: formData.name,
                    position: formData.position,
                    year: formData.year,
                    display_order: parseInt(formData.display_order.toString()),
                    image_url: imageUrl || null,
                }])

            if (error) {
                alert('Failed to add member: ' + error.message)
                return
            }
            alert('Team member added successfully!')
        }

        setFormData({ name: '', position: '', year: '2025/26', display_order: 0, image_url: '' })
        setSelectedImage(null)
        setEditingId(null)
        setShowForm(false)
        fetchMembers()
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return
        }

        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Failed to delete member: ' + error.message)
            return
        }

        alert('Team member deleted successfully!')
        fetchMembers()
    }

    function handleEdit(member: TeamMember) {
        setFormData({
            name: member.name,
            position: member.position,
            year: member.year,
            display_order: member.display_order,
            image_url: member.image_url || '',
        })
        setEditingId(member.id)
        setSelectedImage(null)
        setShowForm(true)
    }

    function handleCancel() {
        setFormData({ name: '', position: '', year: '2025/26', display_order: 0, image_url: '' })
        setEditingId(null)
        setSelectedImage(null)
        setShowForm(false)
    }

    return (
        <div className={styles.managePage}>
            <div className={styles.header}>
                <h1>Manage Team Members</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        handleCancel()
                        setShowForm(!showForm)
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Team Member'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h2>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., Ravindu Wickramasighe"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Position *</label>
                            <select
                                className="form-select"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                            >
                                <option value="">-- Select Position --</option>
                                <optgroup label="Main Position">
                                    <option value="Senior Treasurer">Senior Treasurer</option>
                                </optgroup>
                                <optgroup label="Executive Board">
                                    <option value="President">President</option>
                                    <option value="Secretary">Secretary</option>
                                    <option value="Treasurer">Treasurer</option>
                                    <option value="Vice President">Vice President</option>
                                    <option value="Vice Secretary">Vice Secretary</option>
                                </optgroup>
                                <optgroup label="Coordinators">
                                    <option value="IT Coordinator">IT Coordinator</option>
                                    <option value="Editor">Editor</option>
                                    <option value="Organizer">Organizer</option>
                                </optgroup>
                                <optgroup label="Members">
                                    <option value="Committee Member">Committee Member</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Photo (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-input"
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            />
                            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                                Upload a profile photo. Recommended: Square image, at least 300x300px.
                            </small>
                            {selectedImage && (
                                <p style={{ marginTop: '0.5rem', color: 'var(--color-accent-blue)' }}>
                                    Selected: {selectedImage.name}
                                </p>
                            )}
                            {formData.image_url && !selectedImage && (
                                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    Current photo will be kept (upload new to replace)
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Year *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                required
                                placeholder="e.g., 2025/26"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Display Order *</label>
                            <input
                                type="number"
                                min="0"
                                className="form-input"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                required
                            />
                            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                                Lower numbers appear first within each level. Senior Treasurer uses 0.
                            </small>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            {editingId ? 'Update Member' : 'Add Member'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>
                    <div className="spinner"></div>
                </div>
            ) : members.length === 0 ? (
                <div className={styles.empty}>
                    <p>No team members added yet.</p>
                </div>
            ) : (
                <div className={styles.membersList}>
                    {members.map((member) => (
                        <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberInfo}>
                                <h3>{member.name}</h3>
                                <div className={styles.metadata}>
                                    <span className="badge badge-info">{member.position}</span>
                                    <span className="badge badge-success">{member.year}</span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        Order: {member.display_order}
                                    </span>
                                    {member.image_url && (
                                        <span style={{ color: 'var(--color-accent-green)', fontSize: '0.875rem' }}>
                                            📷 Has Photo
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleEdit(member)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ color: 'var(--color-accent-red)', borderColor: 'var(--color-accent-red)' }}
                                    onClick={() => handleDelete(member.id, member.name)}
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
