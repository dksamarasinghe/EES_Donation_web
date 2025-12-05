'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

interface GoodsItem {
    id: string
    name: string
    required_quantity: string
}

export default function ManageCategoriesPage() {
    const [programs, setPrograms] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedProgram, setSelectedProgram] = useState('')
    const [newCategoryName, setNewCategoryName] = useState('')
    const [loading, setLoading] = useState(false)
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [goodsItems, setGoodsItems] = useState<{ [key: string]: GoodsItem[] }>({})
    const [newItem, setNewItem] = useState({ name: '', quantity: '' })

    useEffect(() => {
        fetchPrograms()
    }, [])

    useEffect(() => {
        if (selectedProgram) {
            fetchCategories(selectedProgram)
        }
    }, [selectedProgram])

    async function fetchPrograms() {
        const { data } = await supabase
            .from('programs')
            .select('*')
            .eq('category', 'charity')
            .order('created_at', { ascending: false })

        setPrograms(data || [])
    }

    async function fetchCategories(programId: string) {
        const { data } = await supabase
            .from('donation_categories')
            .select('*')
            .eq('program_id', programId)

        setCategories(data || [])

        // Fetch goods items for all categories
        if (data) {
            for (const category of data) {
                fetchGoodsItems(category.id)
            }
        }
    }

    async function fetchGoodsItems(categoryId: string) {
        const { data } = await supabase
            .from('goods_items')
            .select('*')
            .eq('category_id', categoryId)
            .order('name')

        setGoodsItems(prev => ({
            ...prev,
            [categoryId]: data || []
        }))
    }

    async function handleAddCategory() {
        if (!selectedProgram || !newCategoryName.trim()) {
            alert('Please select a program and enter a category name')
            return
        }

        setLoading(true)

        const { error } = await supabase
            .from('donation_categories')
            .insert([{
                program_id: selectedProgram,
                name: newCategoryName.trim()
            }])

        if (error) {
            alert('Failed to add category: ' + error.message)
            setLoading(false)
            return
        }

        setNewCategoryName('')
        fetchCategories(selectedProgram)
        setLoading(false)
        alert('Category added successfully!')
    }

    async function handleDeleteCategory(categoryId: string) {
        if (!confirm('Are you sure you want to delete this category and all its items?')) {
            return
        }

        const { error } = await supabase
            .from('donation_categories')
            .delete()
            .eq('id', categoryId)

        if (error) {
            alert('Failed to delete category: ' + error.message)
            return
        }

        fetchCategories(selectedProgram)
        alert('Category deleted successfully!')
    }

    async function handleAddItem(categoryId: string) {
        if (!newItem.name.trim() || !newItem.quantity.trim()) {
            alert('Please enter both item name and required quantity')
            return
        }

        const { error } = await supabase
            .from('goods_items')
            .insert([{
                category_id: categoryId,
                name: newItem.name.trim(),
                required_quantity: newItem.quantity.trim()
            }])

        if (error) {
            alert('Failed to add item: ' + error.message)
            return
        }

        setNewItem({ name: '', quantity: '' })
        fetchGoodsItems(categoryId)
    }

    async function handleDeleteItem(itemId: string, categoryId: string) {
        if (!confirm('Delete this item?')) {
            return
        }

        const { error } = await supabase
            .from('goods_items')
            .delete()
            .eq('id', itemId)

        if (error) {
            alert('Failed to delete item: ' + error.message)
            return
        }

        fetchGoodsItems(categoryId)
    }

    return (
        <div className={styles.categoriesPage}>
            <h1>Manage Donation Categories</h1>
            <p className={styles.subtitle}>
                Add donation categories and define required goods items for each category
            </p>

            <div className={styles.content}>
                {/* Program Selection */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Select Charity Program</h2>
                    <select
                        className="form-select"
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                    >
                        <option value="">-- Select a charity program --</option>
                        {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.title} ({program.status})
                            </option>
                        ))}
                    </select>

                    {programs.length === 0 && (
                        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                            No charity programs found. Create a charity program first.
                        </p>
                    )}
                </div>

                {/* Add Category Form */}
                {selectedProgram && (
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2>Add New Category</h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Category Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Books & Stationery"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddCategory}
                                disabled={loading || !newCategoryName.trim()}
                            >
                                {loading ? 'Adding...' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Categories with Goods Items */}
                {selectedProgram && (
                    <div className="card">
                        <h2>Existing Categories</h2>
                        {categories.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                No categories added yet. Add categories above.
                            </p>
                        ) : (
                            <div className={styles.categoryList}>
                                {categories.map((category) => (
                                    <div key={category.id} className={styles.categoryCard}>
                                        <div className={styles.categoryHeader}>
                                            <div className={styles.categoryTitle}>
                                                <h3>{category.name}</h3>
                                                <span className="badge badge-info">
                                                    {goodsItems[category.id]?.length || 0} items
                                                </span>
                                            </div>
                                            <div className={styles.categoryActions}>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setExpandedCategory(
                                                        expandedCategory === category.id ? null : category.id
                                                    )}
                                                >
                                                    {expandedCategory === category.id ? 'Hide Items' : 'Manage Items'}
                                                </button>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ color: 'var(--color-accent-red)' }}
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expandable Goods Items Section */}
                                        {expandedCategory === category.id && (
                                            <div className={styles.goodsSection}>
                                                <h4>Goods Items for {category.name}</h4>

                                                {/* Add Item Form */}
                                                <div className={styles.addItemForm}>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Item name (e.g., Notebooks)"
                                                        value={newItem.name}
                                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                        style={{ flex: 2 }}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Required qty (e.g., 100)"
                                                        value={newItem.quantity}
                                                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                                        style={{ flex: 1 }}
                                                    />
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleAddItem(category.id)}
                                                    >
                                                        + Add Item
                                                    </button>
                                                </div>

                                                {/* Items List */}
                                                {goodsItems[category.id]?.length > 0 ? (
                                                    <div className={styles.itemsList}>
                                                        {goodsItems[category.id].map(item => (
                                                            <div key={item.id} className={styles.itemRow}>
                                                                <span className={styles.itemName}>{item.name}</span>
                                                                <span className={styles.itemQty}>
                                                                    Required: <strong>{item.required_quantity}</strong>
                                                                </span>
                                                                <button
                                                                    className="btn btn-outline"
                                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--color-accent-red)' }}
                                                                    onClick={() => handleDeleteItem(item.id, category.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                                        No items added yet.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
