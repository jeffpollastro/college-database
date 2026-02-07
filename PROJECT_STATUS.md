# The Crown Hub College Search - Project Status

**Last Updated:** January 21, 2026
**Live URL:** https://college-database-sooty.vercel.app/
**GitHub Repo:** https://github.com/jeffpollastro/college-database

---

## Project Overview

A free college affordability tool for Pocono families that shows "The Gap" - what families actually pay out-of-pocket after financial aid. Built to help first-generation and low-income students find schools where they can graduate without crushing debt.

### Mission Statement
> The Crown Hub exists to close the opportunity gap for underserved families in the Pocono region by providing free, transparent college affordability tools and guidance—ensuring every student can make informed decisions about their future without falling into the debt trap that derails so many first-generation college journeys.

---

## Tech Stack

- **Frontend:** Next.js 16 with TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (auto-deploys from GitHub)
- **Data Source:** U.S. Department of Education College Scorecard

---

## What's Been Built

### Core Features (Completed)

1. **Main Search Page** (`/src/app/page.tsx`)
   - Filter by family income bracket (5 brackets: $0-30k to $110k+)
   - Filter by maximum Gap amount
   - Filter by state (all 50 + DC)
   - Filter by no-loan policy schools
   - Search by school name (partial match)
   - Results sorted by lowest Gap first
   - Plain-language summaries explaining what costs mean
   - "Clear & Start Over" button to reset search

2. **School Detail Pages** (`/src/app/school/[id]/page.tsx`)
   - Full school information with income selector
   - "How The Gap Is Calculated" breakdown showing:
     - Published Cost of Attendance
     - Estimated Grant Aid
     - Resulting Gap
   - 4-Year Cost Projection
   - Gap by all income brackets table
   - Student Outcomes (grad rates, debt, earnings)
   - Travel info from the Poconos
   - "Make This Happen" action section with:
     - Step 1: Net Price Calculator link
     - Step 2: FAFSA link and guidance
     - Step 3: Planning for The Gap
     - Step 4: Connect with The Crown Hub

3. **School Comparison Tool** (`/src/app/compare/page.tsx`)
   - Compare up to 4 schools side-by-side
   - Add schools from search results or by searching
   - Comparison table includes:
     - Gap for selected income bracket
     - Travel costs from Poconos
     - True annual and 4-year costs
     - Cost of attendance
     - No-loan policy status
     - Graduation rates (overall and Pell)
     - Median debt and earnings
     - School type and size
   - Persists across pages via localStorage

4. **Branding** (Completed)
   - Crown Hub banner header on all pages
   - Brand color palette:
     - Dark Brown (#3D3530) - headers/footers
     - Orange (#CF7A3C) - primary buttons/accents
     - Cream (#F5F0E6) - page backgrounds
     - Teal (#5FBBC4) - secondary actions
     - Purple (#6B4380) - compare features
   - Consistent styling across all pages

### Database

- **2,947 schools** in the database
- Data includes:
  - Basic info (name, location, size, type)
  - Cost of attendance
  - Net price by income bracket (The Gap)
  - Gap severity rating (low/medium/high/critical)
  - Travel type and cost from Poconos
  - Graduation rates (4-year and Pell)
  - Median debt and 10-year earnings
  - No-loan policy flag
  - NPC and website URLs

---

## File Structure

```
college-database/
├── public/
│   └── banner_header.png          # Crown Hub logo banner
├── branding/
│   ├── banner_header.png          # Original banner file
│   └── color_palette.png          # Brand colors reference
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main search page
│   │   ├── layout.tsx             # Root layout with metadata
│   │   ├── globals.css            # Global styles
│   │   ├── school/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # School detail page
│   │   └── compare/
│   │       └── page.tsx           # Comparison tool
│   └── lib/
│       └── supabase.ts            # Supabase client + School type
├── next.config.ts                 # Next.js config (ignores TS errors)
├── package.json                   # Dependencies
└── PROJECT_STATUS.md              # This file
```

---

## Accounts & Credentials

- **GitHub:** github.com/jeffpollastro/college-database
- **Vercel:** Connected to GitHub (auto-deploys on push)
- **Supabase:** Project "crown-college-db"
  - Environment variables in Vercel:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Pending / Next Steps

### High Priority

1. **Add Endowment Data**
   - Research source for college endowment data
   - Add column to database
   - Display on school detail pages
   - Consider using as a filter/indicator of financial stability

2. **Custom Domain**
   - Set up colleges.thecrownhub.org
   - Configure in Vercel domains settings
   - Update DNS at Namecheap/domain registrar

3. **501(c)(3) Status & Grant Writing**
   - Elevator pitch completed (see below)
   - Need to formalize nonprofit application
   - Identify grant opportunities for education technology

### Medium Priority

4. **Design/UX Refinements**
   - Review mobile responsiveness
   - Test with actual Pocono families for feedback
   - Accessibility audit (screen readers, contrast)

5. **Data Updates**
   - College Scorecard releases new data annually
   - Create process for updating database
   - Consider automating with Python script

6. **Additional Features to Consider**
   - Save favorite schools (requires user accounts)
   - Email results to self
   - PDF export of comparison
   - Map view of schools
   - Filter by distance/region
   - Filter by major/program offerings

### Low Priority / Future

7. **Analytics**
   - Add Plausible or simple analytics
   - Track which schools are most viewed
   - Understand user search patterns

8. **Agent/Automation**
   - Grant writing agent (mentioned by user)
   - Automated outreach to schools for updated NPC URLs

---

## Elevator Pitch (For Grants/Funders)

**The Problem:**
Every year, thousands of low-income students enroll in college only to drop out—not because they can't do the work, but because they can't afford to stay. Financial aid packages often leave a gap between what's covered and what families actually owe. We call this "The Gap." For families in the Poconos, a rural region with limited college access and high poverty rates, The Gap is the difference between a degree and a derailed future.

**The Solution:**
The Crown Hub College Search is a free tool that shows Pocono families the *real* cost of college before they commit. We translate complex financial aid data into plain language: "This school is free for your income level" or "Warning: This would cost your family $12,000 per year." We include travel costs from the Poconos—whether driving to Penn State or flying to UCLA—so families see the true price tag. And we guide them on exactly what to do next: run the Net Price Calculator, file FAFSA early, and connect with our team for free support.

**The Impact:**
We're not just providing information—we're preventing financial trauma. When a first-generation student drops out with $30,000 in debt and no degree, that burden follows their family for decades. Our tool helps families find schools where they can thrive *and* graduate, breaking the cycle of poverty through informed decisions.

**One-Liner:**
"We show low-income Pocono families what college will actually cost them—before they enroll—so they can find schools where they'll graduate, not drop out."

---

## Key Concepts

### The Gap
The amount families pay out-of-pocket after all grants and scholarships. Does NOT include loans (since those must be repaid).

### Gap Severity Levels
- **Low (Green):** $0 - $2,500/year - Very affordable
- **Medium (Yellow):** $2,501 - $7,500/year - Moderate, plan carefully
- **High (Orange):** $7,501 - $15,000/year - Significant burden
- **Critical (Red):** $15,001+/year - Warning, high dropout risk

### Negative Gap (Money Back)
Some schools provide more aid than the cost of attendance. The excess can cover living expenses, transportation, etc. Displayed as "+$X Money Back"

### Travel Costs
Estimated based on school location:
- **Drive:** Schools within driving distance
- **Fly:** Schools requiring air travel (from ABE, EWR, PHL, LGA, JFK, AVP airports)
- Budget assumes ~5 trips per year

---

## Commands Reference

**Local Development:**
```bash
cd /Users/inchwormdesign/ai_tool/college_search_tool
npm run dev
# Opens at http://localhost:3000
```

**Deploy:**
```bash
git add -A && git commit -m "message" && git push
# Vercel auto-deploys from main branch
```

**Trigger Rebuild (if needed):**
```bash
git commit --allow-empty -m "Trigger Vercel rebuild" && git push
```

---

## Contact & Resources

- **The Crown Hub:** thecrownhub.org
- **College Scorecard Data:** collegescorecard.ed.gov
- **FAFSA:** studentaid.gov/h/apply-for-aid/fafsa

---

*Document created for project continuity. Update as progress is made.*
