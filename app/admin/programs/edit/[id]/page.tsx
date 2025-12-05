'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/utils'
import styles from './page.module.css'

interface ProgramImage {
    id: string
    image_url: string
    display_order: number
}

export default function EditProgramPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fetchingProgram, setFetchingProgram] = useState(true)
    const [existingImages, setExistingImages] = useState<ProgramImage[]>([])
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

    useEffect(() => {
        if (id) {
            fetchProgram()
        }
    }, [id])

    async function fetchProgram() {
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            alert('Program not found')
            router.push('/admin/programs')
            return
        }

        setFormData({
            title: data.title,
            category: data.category,
            description: data.description,
            date: data.date,
            location: data.location,
            total_cost: data.total_cost?.toString() || '',
            status: data.status,
        })

        // Fetch existing images
        const { data: images } = await supabase
            .from('program_images')
            .select('*')
            .eq('program_id', id)
            .order('display_order', { ascending: true })

        setExistingImages(images || [])
        setFetchingProgram(false)
    }

    async function handleDeleteImage(imageId: string, imageUrl: string) {
        if (!confirm('Are you sure you want to delete this image?')) {
            return
        }

        try {
            // Delete from database
            const { error: dbError } = await supabase
                .from('program_images')
                .delete()
                .eq('id', imageId)

            if (dbError) throw dbError

            // Delete from storage
            const path = imageUrl.split('/').pop()
            if (path) {
                await supabase.storage
                    .from('program-images')
                    .remove([path])
            }

            // Update local state
            setExistingImages(existingImages.filter(img => img.id !== imageId))
            alert('Image deleted successfully!')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            alert('Failed to delete image: ' + errorMessage)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Update the program
            const { error: updateError } = await supabase
                .from('programs')
                .update({
                    title: formData.title,
                    category: formData.category,
                    description: formData.description,
                    date: formData.date,
                    location: formData.location,
                    total_cost: formData.category === 'charity' && formData.total_cost ? parseFloat(formData.total_cost) : null,
                    status: formData.status,
                })
                .eq('id', id)

            if (updateError) throw updateError

            // Upload new feature image if selected
            if (featureImage) {
                const imageUrl = await uploadImage('program-images', featureImage)
                if (imageUrl) {
                    // Delete old feature image (display_order 0) if exists
                    const oldFeature = existingImages.find(img => img.display_order === 0)
                    if (oldFeature) {
                        await supabase
                            .from('program_images')
                            .delete()
                            .eq('id', oldFeature.id)
                    }

                    // Insert new feature image
                    await supabase
                        .from('program_images')
                        .insert([{
                            program_id: id,
                            image_url: imageUrl,
                            display_order: 0
                        }])
                }
            }

            // Upload new gallery images if any
            if (galleryImages.length > 0) {
                // Get current max display_order (excluding feature image)
                const maxOrder = Math.max(
                    ...existingImages
                        .filter(img => img.display_order > 0)
                        .map(img => img.display_order),
                    0
                )

                for (let i = 0; i < galleryImages.length; i++) {
                    const file = galleryImages[i]
                    const imageUrl = await uploadImage('program-images', file)

                    if (imageUrl) {
                        await supabase
                            .from('program_images')
                            .insert([{
                                program_id: id,
                                image_url: imageUrl,
                                display_order: maxOrder + i + 1
                            }])
                    }
                }
            }

            alert('Program updated successfully!')
            router.push('/admin/programs')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError('Failed to update program: ' + errorMessage)
            console.error('Error updating program:', err)
            setLoading(false)
        }
    }

    if (fetchingProgram) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    const currentFeatureImage = existingImages.find(img => img.display_order === 0)
    const currentGalleryImages = existingImages.filter(img => img.display_order > 0)

    return (
        <div className={styles.editProgramPage}>
            <h1>Edit Program</h1>

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
                        <option value="project">Project</option>
                        <option value="charity">Charity Program</option>
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
                        />
                    </div>
                )}

                {/* Feature Image Section */}
                <div className={styles.imageSection}>
                    <h3>Feature Image (Hero Image)</h3>
                    <p className={styles.imageHelp}>This image appears at the top of the program detail page</p>

                    {currentFeatureImage && (
                        <div className={styles.existingImage}>
                            <img src={currentFeatureImage.image_url} alt="Feature" />
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ color: 'var(--color-accent-red)', marginTop: '0.5rem' }}
                                onClick={() => handleDeleteImage(currentFeatureImage.id, currentFeatureImage.image_url)}
                            >
                                Delete Feature Image
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={(e) => setFeatureImage(e.target.files?.[0] || null)}
                        style={{ marginTop: '1rem' }}
                    />
                    {featureImage && (
                        <p style={{ marginTop: '0.5rem', color: 'var(--color-accent-blue)' }}>
                            New feature image selected: {featureImage.name}
                        </p>
                    )}
                </div>

                {/* Gallery Images Section */}
                <div className={styles.imageSection}>
                    <h3>Gallery Images</h3>
                    <p className={styles.imageHelp}>Additional images shown in the program gallery</p>

                    {currentGalleryImages.length > 0 && (
                        <div className={styles.galleryGrid}>
                            {currentGalleryImages.map((img) => (
                                <div key={img.id} className={styles.galleryItem}>
                                    <img src={img.image_url} alt="Gallery" />
                                    <button
                                        type="button"
                                        className={styles.deleteBtn}
                                        onClick={() => handleDeleteImage(img.id, img.image_url)}
                                        title="Delete image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="form-input"
                        onChange={(e) => setGalleryImages(e.target.files ? Array.from(e.target.files) : [])}
                        style={{ marginTop: '1rem' }}
                    />
                    {galleryImages.length > 0 && (
                        <p style={{ marginTop: '0.5rem', color: 'var(--color-accent-blue)' }}>
                            {galleryImages.length} new gallery image(s) selected
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
                        {loading ? 'Updating...' : 'Update Program'}
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
