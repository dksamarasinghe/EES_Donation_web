# EES Society Website

A modern, full-stack website for the Electronic and Embedded System Society at the University of Sri Jayewardenepura.

## Features

- 🏠 **Home Page** - Society information, mission, vision,and statistics
- 📋 **Programs** - Events, projects, and charity programs with category filtering
- 💝 **Donation System** - Accept donations for charity programs with real-time progress tracking
- 📊 **Donation History** - Transparent display of all donations
- 💰 **Expenses Tracking** - Detailed expense records with invoice uploads
- 👤 **Admin Panel** - Manage programs, expenses, and view analytics

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Vanilla CSS with CSS Modules
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ees-society-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow instructions in `SUPABASE_SETUP.md`
   - Run the SQL schema from `supabase-schema.sql`
   - Create your first admin user

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ees-society-website/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── donate/            # Donation form
│   ├── donation-history/  # Donation history table
│   ├── expenses/          # Expenses display
│   ├── programs/          # Programs listing
│   └── team/              # Team page
├── components/            # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ProgramCard.tsx
├── lib/                   # Utilities and types
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper functions
├── public/               # Static assets
│   └── images/          # Logos and images
└── supabase-schema.sql  # Database schema
```

## Admin Access

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. Manage programs, expenses, and view analytics

**First Admin Setup:**
- Create a user in Supabase Auth
- Update the `users` table: `SET is_admin = TRUE`

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

**Quick Deploy to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Documentation

- `SUPABASE_SETUP.md` - Database setup guide
- `DEPLOYMENT.md` - Vercel deployment guide

## Features Breakdown

### Public Pages

- **Home** - Hero section, about cards, statistics, CTA
- **Programs** - Filter by category, view charity progress
- **Donate** - Form with program/category selection
- **Donation History** - Complete donation records
- **Expenses** - Transparent expense tracking
- **Team** - Committee members (coming soon)

### Admin Features

- Dashboard with statistics
- Create/edit/delete programs
- Add donation categories to charity programs
- Upload program images
- Manage expenses with invoice uploads
- View all donations

## Development

**Build for production:**
```bash
npm run build
```

**Run production build:**
```bash
npm start
```

**Linting:**
```bash
npm run lint
```

## Contributing

This is a university society project. If you're a member and want to contribute:

1. Contact the admin team
2. Get added as a collaborator
3. Create a feature branch
4. Submit a pull request

## Support

For issues or questions:
- Admin panel technical issues: Contact your tech lead
- Content updates: Use the admin panel
- Feature requests: Submit via GitHub Issues

## License

© 2024 EES Society, University of Sri Jayewardenepura. All rights reserved.

---

Made with ❤️ by dksamarasinghe.com
