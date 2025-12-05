import { supabase } from './supabase'

/**
 * Upload an image to Supabase Storage
 * @param bucket - Storage bucket name
 * @param file - File to upload
 * @param folder - Optional folder path within bucket
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
    bucket: string,
    file: File,
    folder?: string
): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

    if (error) {
        throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return publicUrl
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - Storage bucket name
 * @param url - Public URL of the image to delete
 */
export async function deleteImage(bucket: string, url: string): Promise<void> {
    // Extract file path from URL
    const urlParts = url.split(`${bucket}/`)
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

    if (error) {
        throw new Error(`Delete failed: ${error.message}`)
    }
}

/**
 * Format currency in LKR
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

/**
 * Format date for HTML input
 */
export function formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0]
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0
    return Math.min(Math.round((part / total) * 100), 100)
}
