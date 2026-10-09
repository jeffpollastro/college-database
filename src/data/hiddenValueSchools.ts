// Hidden Value Schools: very selective, high-endowment schools that can cost a
// low-income family little or nothing. Mirrors the table on
// crownroots.org/college-database.html. Keep the two in sync.
//
// `gap` is yearly net price (full cost of attendance less grants, before loans)
// from each school's own net price calculator, run October 2026 for one sample
// family: Pennsylvania, household of five, renting, $2,000 in savings. Each
// bracket was run at one income: $20,000, $39,000, $61,500, $92,500, $130,000.
// null means the calculator gave no usable result. East Stroudsburg was run for
// a student with a 4.0 GPA. Published averages (IPEDS, Tuition Tracker) are not
// used here because they lag behind current aid policy.

export type IncomeBracket = '0-30k' | '30-48k' | '48-75k' | '75-110k' | '110k+'

export type HiddenValueSchool = {
  id: string // schools.id in Supabase
  unitid: string
  name: string
  location: string
  drive: string
  endowment: string
  acceptRate: string
  gap: Record<IncomeBracket, number | null>
  sourceLabel: string
  sourceUrl: string
  note?: string
}

export const hiddenValueSchools: HiddenValueSchool[] = [
  {
    id: 'e54b9a6f-ca74-4822-afb9-6a038ec85c43',
    unitid: '186131',
    name: 'Princeton University',
    location: 'Princeton, NJ',
    drive: '~1 hr 40 min',
    endowment: '$37.7B',
    acceptRate: '5%',
    gap: { '0-30k': 0, '30-48k': 0, '48-75k': 0, '75-110k': 0, '110k+': 0 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://admission.princeton.edu/cost-aid/net-price-calculator',
  },
  {
    id: '2fe840f7-9782-481e-80b8-6904a0fdec15',
    unitid: '215062',
    name: 'Univ. of Pennsylvania',
    location: 'Philadelphia, PA',
    drive: '~2 hrs',
    endowment: '$24.8B',
    acceptRate: '6%',
    gap: { '0-30k': 3287, '30-48k': 3287, '48-75k': 3287, '75-110k': null, '110k+': 15482 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/upenn',
  },
  {
    id: '83201163-b4f2-437f-a9a9-3a882c9c0718',
    unitid: '190099',
    name: 'Colgate University',
    location: 'Hamilton, NY',
    drive: '~4 hrs',
    endowment: '$1.1B',
    acceptRate: '19%',
    gap: { '0-30k': 4900, '30-48k': 4900, '48-75k': 4900, '75-110k': 6600, '110k+': 11200 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/colgate',
  },
  {
    id: '6193c12d-b6e1-4e12-bf73-5606af246fea',
    unitid: '216287',
    name: 'Swarthmore College',
    location: 'Swarthmore, PA',
    drive: '~2.5 hrs',
    endowment: '$2.5B',
    acceptRate: '9%',
    gap: { '0-30k': 3700, '30-48k': 3700, '48-75k': 3700, '75-110k': 5428, '110k+': 10039 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/swarthmore',
  },
  {
    id: '0663de5e-1257-487a-9880-c641b068f307',
    unitid: '213385',
    name: 'Lafayette College',
    location: 'Easton, PA',
    drive: '~45 min',
    endowment: '$1.1B',
    acceptRate: '39%',
    gap: { '0-30k': 4047, '30-48k': 4047, '48-75k': 4047, '75-110k': 7957, '110k+': 16592 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/lafayette',
  },
  {
    id: 'a7f473c0-ed68-4446-ab41-8663288ed551',
    unitid: '213543',
    name: 'Lehigh University',
    location: 'Bethlehem, PA',
    drive: '~45 min',
    endowment: '$2.2B',
    acceptRate: '29%',
    gap: { '0-30k': 6400, '30-48k': 6400, '48-75k': 9900, '75-110k': 13050, '110k+': 18950 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/lehigh',
    note: 'Lehigh Commitment',
  },
  {
    id: '4c3d8528-52bb-45a6-9d33-ce485c60a4cd',
    unitid: '212911',
    name: 'Haverford College',
    location: 'Haverford, PA',
    drive: '~2.5 hrs',
    endowment: '$875M',
    acceptRate: '15%',
    gap: { '0-30k': 4200, '30-48k': 4200, '48-75k': 5700, '75-110k': 7428, '110k+': 13039 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/haverford',
  },
  {
    id: 'd334954a-d9cd-43de-a141-6115ae3f495e',
    unitid: '191515',
    name: 'Hamilton College',
    location: 'Clinton, NY',
    drive: '~4 hrs',
    endowment: '$1.1B',
    acceptRate: '20%',
    gap: { '0-30k': 6900, '30-48k': 6900, '48-75k': 6900, '75-110k': 8628, '110k+': 13239 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/hamilton',
  },
  {
    id: '71860ee6-f67f-4cd3-bf0a-91793de00f5d',
    unitid: '195030',
    name: 'Univ. of Rochester',
    location: 'Rochester, NY',
    drive: '~4.5 hrs',
    endowment: '$3B',
    acceptRate: '28%',
    gap: { '0-30k': 9049, '30-48k': 9049, '48-75k': 9049, '75-110k': 9759, '110k+': 14594 },
    sourceLabel: 'Rochester financial aid',
    sourceUrl: 'https://www.rochester.edu/financial-aid/',
    note: 'Aid offer includes a $3,500 loan',
  },
  {
    id: '1c33a43c-aa7c-4f2e-bee9-789c26069a21',
    unitid: '211291',
    name: 'Bucknell University',
    location: 'Lewisburg, PA',
    drive: '~2 hrs',
    endowment: '$900M',
    acceptRate: '35%',
    gap: { '0-30k': 9535, '30-48k': 9535, '48-75k': 9535, '75-110k': 12190, '110k+': 16830 },
    sourceLabel: 'School calculator',
    sourceUrl: 'https://npc.collegeboard.org/app/bucknell',
  },
]

// East Stroudsburg is the comparison point: what staying local costs.
export const hiddenValueBaseline: HiddenValueSchool =
{
    id: '3e587b5e-1cf8-46f6-b237-048aa3a7b804',
    unitid: '212115',
    name: 'East Stroudsburg Univ.',
    location: 'E. Stroudsburg, PA',
    drive: '0 min',
    endowment: '$23.8M',
    acceptRate: '90%+',
    gap: { '0-30k': 11745, '30-48k': 11745, '48-75k': 16030, '75-110k': 24298, '110k+': 24298 },
    sourceLabel: 'ESU calculator',
    sourceUrl: '/school/3e587b5e-1cf8-46f6-b237-048aa3a7b804',
  }
