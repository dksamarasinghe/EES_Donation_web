// Database table types
export interface User {
    id: string
    email: string
    full_name: string | null
    is_admin: boolean
    created_at: string
}

export interface Program {
    id: string
    title: string
    category: 'event' | 'project' | 'charity'
    description: string
    date: string
    location: string | null
    total_cost: number | null
    status: 'draft' | 'published'
    created_at: string
    updated_at: string
}

export interface ProgramImage {
    id: string
    program_id: string
    image_url: string
    display_order: number
    created_at: string
}

export interface DonationCategory {
    id: string
    program_id: string
    name: string
    created_at: string
}

export interface Donation {
    id: string
    donor_name: string
    donor_address: string
    donor_contact: string
    program_id: string
    category_id: string
    amount: number
    donation_date: string
    created_at: string
}

export interface Expense {
    id: string
    program_id: string
    description: string
    amount: number
    expense_date: string
    invoice_url: string | null
    created_at: string
    updated_at: string
}

export interface CharityProgramStats {
    id: string
    title: string
    total_cost: number
    amount_raised: number
    total_expenses: number
    amount_remaining: number
}

// Enhanced types with relations
export interface ProgramWithImages extends Program {
    program_images: ProgramImage[]
}

export interface ProgramWithStats extends Program {
    program_images: ProgramImage[]
    donation_categories: DonationCategory[]
    amount_raised?: number
    total_expenses?: number
    amount_remaining?: number
}

export interface DonationWithDetails extends Donation {
    programs: {
        title: string
        total_cost: number | null
    }
    donation_categories: {
        name: string
    }
}

export interface ExpenseWithProgram extends Expense {
    programs: {
        title: string
    }
}

// Form types
export interface DonationFormData {
    donor_name: string
    donor_address: string
    donor_contact: string
    program_id: string
    category_id: string
    amount: number
}

export interface ProgramFormData {
    title: string
    category: 'event' | 'project' | 'charity'
    description: string
    date: string
    location: string
    total_cost: number | null
    status: 'draft' | 'published'
    donation_categories: string[] // For charity programs
}

export interface ExpenseFormData {
    program_id: string
    description: string
    amount: number
    expense_date: string
    invoice_file: File | null
}
