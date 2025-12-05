'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

interface Category {
    id: string
    name: string
}

interface GoodsItem {
    id: string
    category_id: string
    name: string
    donation_categories: {
        name: string
    }
}

export default function GoodsItemsPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [items, setItems] = useState<GoodsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [newItemName, setNewItemName] = useState('')
    const [editingItem, setEditingItem] = useState<GoodsItem | null>(null)

    useEffect(() => {
        fetchCategories()
        fetchItems()
    }, [])

    async function fetchCategories() {
        const { data } = await supabase
            .from('donation_categories')
            .select('id, name, program_id, programs(title)')
            .order('name')

        // Get unique categories
        const uniqueCategories = new Map<string, Category>()
        data?.forEach(cat => {
            if (!uniqueCategories.has(cat.name)) {
                uniqueCategories.set(cat.name, { id: cat.id, name: cat.name })
            }
        })

        setCategories(Array.from(uniqueCategories.values()))
    }

    async function fetchItems() {
        const { data, error } = await supabase
            .from('goods_items')
            .select(`
        *,
        donation_categories (name)
      `)
            .order('name')

        if (error) {
            console.error('Error fetching items:', error)
            setLoading(false)
            return
        }

        setItems(data || [])
        setLoading(false)
    }

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault()

        if (!selectedCategory || !newItemName.trim()) {
            alert('Please select a category and enter an item name')
            return
        }

        const { error } = await supabase
            .from('goods_items')
            .insert([{
                category_id: selectedCategory,
                name: newItemName.trim()
            }])

        if (error) {
            alert('Failed to add item: ' + error.message)
            return
        }

        setNewItemName('')
        fetchItems()
    }

    async function handleDelete(itemId: string) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return
        }

        const { error } = await supabase
            .from('goods_items')
            .delete()
            .eq('id', itemId)

        if (error) {
            alert('Failed to delete: ' + error.message)
            return
        }

        fetchItems()
    }

    async function handleUpdate() {
        if (!editingItem) return

        const { error } = await supabase
            .from('goods_items')
            .update({ name: editingItem.name })
            .eq('id', editingItem.id)

        if (error) {
            alert('Failed to update: ' + error.message)
            return
        }

        setEditingItem(null)
        fetchItems()
    }

    return (
        <div className={styles.page}>
            <h1>Manage Goods Items Catalog</h1>
            <p className={styles.subtitle}>Define items that can be donated for each category</p>

            {/* Add New Item */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Add New Item</h2>
                <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        required
                        style={{ flex: '1', minWidth: '200px' }}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        className="form-input"
                        placeholder="Item name (e.g., Notebooks)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                        style={{ flex: '2', minWidth: '200px' }}
                    />

                    <button type="submit" className="btn btn-primary">
                        + Add Item
                    </button>
                </form>
            </div>

            {/* Items List */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem' }}>Existing Items</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : items.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                        No items yet. Add your first item above.
                    </p>
                ) : (
                    <div className={styles.itemsList}>
                        {items.map(item => (
                            <div key={item.id} className={styles.itemCard}>
                                {editingItem?.id === item.id ? (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editingItem.name}
                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                        <button className="btn btn-primary" onClick={handleUpdate}>
                                            Save
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setEditingItem(null)}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.itemInfo}>
                                            <h3>{item.name}</h3>
                                            <span className="badge badge-info">{item.donation_categories.name}</span>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => setEditingItem(item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                style={{ color: 'var(--color-accent-red)' }}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
