'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/utils'
import styles from './page.module.css'

export default function NewProgramPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [featureImage, setFeatureImage] = useState<File | null>(null)
    const [galleryImages, setGalleryImages] = useState<File[]>([])

    const [formData, setFormData] = useState({
        title: '',
        category: 'event',
        description: '',
        date: '',
        location: '',
        total_cost: '',
        status: 'draft',
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // 1. Create the program
            const { data: program, error: insertError } = await supabase
                .from('programs')
                .insert([{
                    title: formData.title,
                    category: formData.category,
                    description: formData.description,
                    date: formData.date,
                    location: formData.location,
                    total_cost: formData.category === 'charity' && formData.total_cost ? parseFloat(formData.total_cost) : null,
                    funding_goal: formData.category === 'charity' && formData.total_cost ? parseFloat(formData.total_cost) : null,
                    status: formData.status,
                }])
                .select()
                .single()

            if (insertError) throw insertError

            // 2. Upload feature image if selected
            if (featureImage && program) {
                const imageUrl = await uploadImage('program-images', featureImage)
                if (imageUrl) {
                    await supabase
                        .from('program_images')
                        .insert([{
                            program_id: program.id,
                            image_url: imageUrl,
                            display_order: 0 // Feature image is always 0
                        }])
                }
            }

            // 3. Upload gallery images if any
            if (galleryImages.length > 0 && program) {
                for (let i = 0; i < galleryImages.length; i++) {
                    const file = galleryImages[i]
                    const imageUrl = await uploadImage('program-images', file)

                    if (imageUrl) {
                        await supabase
                            .from('program_images')
                            .insert([{
                                program_id: program.id,
                                image_url: imageUrl,
                                display_order: i + 1 // Gallery starts from 1
                            }])
                    }
                }
            }

            alert('Program created successfully!')
            router.push('/admin/programs')
        } catch (err: any) {
            setError('Failed to create program: ' + err.message)
            console.error('Error creating program:', err)
            setLoading(false)
        }
    }

    return (
        <div className={styles.newProgramPage}>
            <h1>Create New Program</h1>

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className="form-group">
                    <label htmlFor="title" className="form-label">Program Title *</label>
                    <input
                        id="title"
                        type="text"
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category" className="form-label">Category *</label>
                    <select
                        id="category"
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="event">Event</option>
                        <option value="charity">Charity</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="form-label">Description *</label>
                    <textarea
                        id="description"
                        className="form-textarea"
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date" className="form-label">Date *</label>
                    <input
                        id="date"
                        type="date"
                        className="form-input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location" className="form-label">Location *</label>
                    <input
                        id="location"
                        type="text"
                        className="form-input"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                </div>

                {formData.category === 'charity' && (
                    <div className="form-group">
                        <label htmlFor="total_cost" className="form-label">Total Cost (LKR) *</label>
                        <input
                            id="total_cost"
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-input"
                            value={formData.total_cost}
                            onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                            required={formData.category === 'charity'}
                            placeholder="e.g., 1000000"
                        />
                        <small style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                            Target amount to raise for this charity program
                        </small>
                    </div>
                )}

                {/* Feature Image Section */}
                <div className={styles.imageSection}>
                    <h3>Feature Image (Hero Image)</h3>
                    <p className={styles.imageHelp}>This image appears at the top of the program detail page</p>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={(e) => setFeatureImage(e.target.files?.[0] || null)}
                    />
                    {featureImage && (
                        <p style={{ marginTop: '0.5rem', color: 'var(--color-accent-blue)' }}>
                            Selected: {featureImage.name}
                        </p>
                    )}
                </div>

                {/* Gallery Images Section */}
                <div className={styles.imageSection}>
                    <h3>Gallery Images</h3>
                    <p className={styles.imageHelp}>Additional images shown in the program gallery</p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="form-input"
                        onChange={(e) => setGalleryImages(e.target.files ? Array.from(e.target.files) : [])}
                    />
                    {galleryImages.length > 0 && (
                        <p style={{ marginTop: '0.5rem', color: 'var(--color-accent-blue)' }}>
                            {galleryImages.length} image(s) selected
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="status" className="form-label">Status *</label>
                    <select
                        id="status"
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Program'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => router.push('/admin/programs')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
