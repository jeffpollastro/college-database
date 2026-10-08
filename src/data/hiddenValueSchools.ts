// Hidden Value Schools: very selective, high-endowment schools that can cost a
// low-income family little or nothing. Mirrors the table on
// crownroots.org/college-database.html. Keep the two in sync.
//
// `gap` is net price by family income bracket. Figures come from Tuition Tracker
// (IPEDS, FY2023-24), except Lehigh, whose Lehigh Commitment is newer than the
// published data: its figures come from Lehigh's own net price calculator for
// 2027-28, run 2026-10-08 for a Pennsylvania household of five at one income in
// each bracket.

export type IncomeBracket = '0-30k' | '30-48k' | '48-75k' | '75-110k' | '110k+'

export type HiddenValueSchool = {
  id: string // schools.id in Supabase
  unitid: string
  name: string
  location: string
  drive: string
  endowment: string
  acceptRate: string
  gap: Record<IncomeBracket, number>
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
    gap: { '0-30k': 46, '30-48k': 396, '48-75k': 1369, '75-110k': 5036, '110k+': 40588 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=186131',
  },
  {
    id: '2fe840f7-9782-481e-80b8-6904a0fdec15',
    unitid: '215062',
    name: 'Univ. of Pennsylvania',
    location: 'Philadelphia, PA',
    drive: '~2 hrs',
    endowment: '$24.8B',
    acceptRate: '6%',
    gap: { '0-30k': 0, '30-48k': 350, '48-75k': 11559, '75-110k': 28210, '110k+': 61979 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=215062',
  },
  {
    id: '83201163-b4f2-437f-a9a9-3a882c9c0718',
    unitid: '190099',
    name: 'Colgate University',
    location: 'Hamilton, NY',
    drive: '~4 hrs',
    endowment: '$1.1B',
    acceptRate: '19%',
    gap: { '0-30k': 6832, '30-48k': 3006, '48-75k': 15286, '75-110k': 24507, '110k+': 54146 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=190099',
  },
  {
    id: '6193c12d-b6e1-4e12-bf73-5606af246fea',
    unitid: '216287',
    name: 'Swarthmore College',
    location: 'Swarthmore, PA',
    drive: '~2.5 hrs',
    endowment: '$2.5B',
    acceptRate: '9%',
    gap: { '0-30k': 8644, '30-48k': 5565, '48-75k': 12864, '75-110k': 25228, '110k+': 53443 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=216287',
  },
  {
    id: '0663de5e-1257-487a-9880-c641b068f307',
    unitid: '213385',
    name: 'Lafayette College',
    location: 'Easton, PA',
    drive: '~45 min',
    endowment: '$1.1B',
    acceptRate: '39%',
    gap: { '0-30k': 14197, '30-48k': 8312, '48-75k': 12148, '75-110k': 14046, '110k+': 58735 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=213385',
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
    sourceLabel: 'Lehigh calculator',
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
    gap: { '0-30k': 8331, '30-48k': 10386, '48-75k': 13283, '75-110k': 20102, '110k+': 50879 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=212911',
  },
  {
    id: 'd334954a-d9cd-43de-a141-6115ae3f495e',
    unitid: '191515',
    name: 'Hamilton College',
    location: 'Clinton, NY',
    drive: '~4 hrs',
    endowment: '$1.1B',
    acceptRate: '20%',
    gap: { '0-30k': 8977, '30-48k': 10611, '48-75k': 12147, '75-110k': 23051, '110k+': 52453 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=191515',
  },
  {
    id: '71860ee6-f67f-4cd3-bf0a-91793de00f5d',
    unitid: '195030',
    name: 'Univ. of Rochester',
    location: 'Rochester, NY',
    drive: '~4.5 hrs',
    endowment: '$3B',
    acceptRate: '28%',
    gap: { '0-30k': 10741, '30-48k': 13523, '48-75k': 23403, '75-110k': 30946, '110k+': 51942 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=195030',
  },
  {
    id: '1c33a43c-aa7c-4f2e-bee9-789c26069a21',
    unitid: '211291',
    name: 'Bucknell University',
    location: 'Lewisburg, PA',
    drive: '~2 hrs',
    endowment: '$900M',
    acceptRate: '35%',
    gap: { '0-30k': 23316, '30-48k': 13643, '48-75k': 26316, '75-110k': 31301, '110k+': 61929 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=211291',
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
    gap: { '0-30k': 16796, '30-48k': 15863, '48-75k': 19001, '75-110k': 23104, '110k+': 25024 },
    sourceLabel: 'Tuition Tracker',
    sourceUrl: 'https://www.tuitiontracker.org/school.html?unitid=212115',
  }
