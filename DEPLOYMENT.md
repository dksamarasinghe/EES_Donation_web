# EES Society Website - Deployment Guide

Complete guide for deploying your EES Society website to Vercel and connecting to Supabase.

## Prerequisites

Before deploying, ensure you have:
- ✅ Completed Supabase setup (see `SUPABASE_SETUP.md`)
- ✅ Created your first admin user in Supabase
- ✅ Tested the application locally
- ✅ GitHub account
- ✅ Vercel account (free tier works)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - EES Society website"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it: `ees-society-website` (or your preferred name)
3. Make it **private** (recommended for university projects)
4. **Do NOT** initialize with README, .gitignore, or license

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ees-society-website.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and use your GitHub account
3. Authorize Vercel to access your repositories

### 2.2 Import Project

1. Click "Add New" → "Project"
2. Find your `ees-society-website` repository
3. Click "Import"

### 2.3 Configure Project

**Framework Preset**: Next.js (automatically detected)

**Root Directory**: `./` (leave as is)

**Build Command**: `npm run build` (automatically set)

**Output Directory**: `.next` (automatically set)

### 2.4 Configure Environment Variables

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

**Where to find these values:**
- Go to your Supabase project
- Click Settings → API
- Copy "Project URL" and "Project API keys" → "anon public"

### 2.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://ees-society-website.vercel.app`

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Domain

1. In Vercel project settings, go to "Domains"
2. Click "Add"
3. Enter your domain (e.g., `ees-society.sjp.ac.lk`)

### 3.2 Update DNS

Add these records in your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 4: Post-Deployment Setup

### 4.1 Test Authentication

1. Visit `https://your-site.vercel.app/admin/login`
2. Login with your admin credentials
3. Verify you can access the admin panel

### 4.2 Upload Logos

1. Replace placeholder logos in `/public/images/` with actual:
   - `usj-logo.png`
   - `ees-logo.png`
2. Commit and push changes:

```bash
git add public/images/
git commit -m "Add official logos"
git push
```

Vercel will automatically redeploy.

### 4.3 Create Test Programs

1. Go to Admin Panel → Programs
2. Create at least one program in each category:
   - Event
   - Project
   - Charity Program (with donation categories)
3. Upload program images to Supabase Storage

### 4.4 Test Donation Flow

1. Visit the Programs page
2. Find a charity program
3. Click "Donate to this program"
4. Fill out and submit the donation form
5. Check Donation History page to verify

## Step 5: Ongoing Maintenance

### 5.1 Updating Content

**Via Admin Panel:**
- Programs, expenses, and donation categories can be managed through `/admin`
- No code changes needed

**Via Code:**
- Update home page content in `app/page.tsx`
- Modify styling in CSS modules
- Commit and push - Vercel auto-deploys

### 5.2 Monitoring

**Vercel Analytics** (Free):
- Visit project → Analytics tab
- View page views, performance, etc.

**Supabase Monitoring**:
- Database usage
- Storage usage
- API requests

### 5.3 Database Backups

1. In Supabase, go to Settings → Database
2. Use "Setup your automatic backups" (paid plans)
3. OR manually export data periodically via SQL Editor

## Troubleshooting

### Issue: Build Fails

**Solution:**
1. Check build logs in Vercel
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

**Fix:**
```bash
npm run build
```
Fix any errors locally before pushing.

### Issue: Images Not Loading

**Solution:**
1. Check `next.config.js` has Supabase domain
2. Verify images uploaded to correct Storage bucket
3. Check bucket is public

### Issue: Can't Login to Admin

**Solution:**
1. Verify user exists in Supabase Auth
2. Check `is_admin = true` in users table
3. Check browser console for errors

### Issue: Donations Not Saving

**Solution:**
1. Check Supabase RLS policies
2. Verify `donations` table has correct INSERT policy
3. Check browser console for errors

## Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ `.env.local` in `.gitignore`
- ✅ RLS policies enabled on all tables
- ✅ Admin routes protected by authentication
- ✅ Supabase service role key **NOT** exposed in frontend

## Performance Optimization

### Enable Vercel Speed Insights

1. Go to project → Settings → Speed Insights
2. Enable it (free)
3. Get real user performance metrics

### Image Optimization

- Next.js automatically optimizes images via `next/image`
- Store images in Supabase Storage (not in code repository)
- Use WebP format when possible

### Caching

- Vercel automatically caches static pages
- API routes cached based on headers
- Supabase queries can be optimized with proper indexes

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Final Checklist

Before announcing your website:

- [ ] All logos uploaded
- [ ] At least 3 programs published
- [ ] Admin panel tested
- [ ] Donation flow tested end-to-end
- [ ] Donation history displays correctly
- [ ] Expenses page shows data
- [ ] Mobile responsive (test on phone)
- [ ] Custom domain configured (if applicable)
- [ ] Team page content added
- [ ] Contact information updated in footer

---

**Congratulations!** 🎉 Your EES Society website is now live!
