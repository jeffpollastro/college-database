// Crown Top 10 Picks.
//
// Reviewed once a year, and sooner when a school changes its aid.
// Source of truth and method: crown_hub/03_College_Database/Crown_Picks_Top10_2026-10.md
// in the ai_tool repo. Update `lastReviewed` whenever this list changes.
//
// `owed` is what one sample family owes the school per year for tuition, fees,
// housing, and food after grants, before loans. Sample family: Pennsylvania
// residents, household of five, $56,000 income, student with a 3.5 GPA and
// 1110 SAT living on campus. Figures come from each school's own calculator.
// `olderData` marks figures built on pre-2024 calculator data.

export type CrownPick = {
  rank: number
  id: string // schools.id in Supabase
  unitid: string
  name: string
  state: string
  owed: string
  olderData?: boolean
  degrees: string
  why: string
}

export const crownPicksMeta = {
  lastReviewed: 'October 2026',
  methodUrl: 'https://crownroots.org/college-database.html#crown-top-10',
}

export const crownPicks: CrownPick[] = [
  {
    rank: 1,
    id: '33a0afb5-10d5-4873-853f-e8cf048741ed',
    unitid: '215284',
    name: 'Pitt-Johnstown',
    state: 'PA',
    owed: '$7,411',
    olderData: true,
    degrees: 'Computer, electrical, mechanical, chemical, and civil engineering; computer science; finance; accounting',
    why: 'Lowest bill we found. Pitt matches the Pell Grant dollar for dollar.',
  },
  {
    rank: 2,
    id: '443cf0a6-5b20-4b8f-90de-62e83d450a84',
    unitid: '206695',
    name: 'Youngstown State',
    state: 'OH',
    owed: '$10,966',
    degrees: 'Electrical, chemical, mechanical, civil, and industrial engineering; computer science; nursing; accounting',
    why: 'Charges Pennsylvania students almost the Ohio price. Strong engineering.',
  },
  {
    rank: 3,
    id: 'e9f50e2b-4b7a-43ad-afff-4089f84bd98c',
    unitid: '216038',
    name: 'Slippery Rock',
    state: 'PA',
    owed: '$8,666',
    degrees: 'Safety management; civil and mechanical engineering; nursing; accounting; finance',
    why: 'Best graduation rates on the list.',
  },
  {
    rank: 4,
    id: 'f03a7ce0-4fd1-4af5-a661-4f437e3448c4',
    unitid: '498562',
    name: 'Commonwealth University (Bloomsburg)',
    state: 'PA',
    owed: '$8,732',
    degrees: 'Nursing; computer science; business; special education; social work',
    why: 'Large nursing program about 90 minutes from the Poconos.',
  },
  {
    rank: 5,
    id: '1608b939-4869-4db2-bbc6-caec17d2050b',
    unitid: '498571',
    name: 'PennWest',
    state: 'PA',
    owed: '$8,747',
    degrees: 'Nursing; mechatronics and electrical engineering technology; accounting; finance; art',
    why: 'Clear scholarship amounts by GPA, so families know where they stand.',
  },
  {
    rank: 6,
    id: 'ee79206f-ca59-4248-9d5c-d925fddea83e',
    unitid: '213020',
    name: 'Indiana University of Pennsylvania',
    state: 'PA',
    owed: '$7,700 to $9,800',
    olderData: true,
    degrees: 'Safety sciences; nursing; computer science; finance; accounting; design',
    why: 'Safety sciences graduates earn as much as engineers.',
  },
  {
    rank: 7,
    id: '3e587b5e-1cf8-46f6-b237-048aa3a7b804',
    unitid: '212115',
    name: 'East Stroudsburg',
    state: 'PA',
    owed: '$7,550 to $9,650',
    olderData: true,
    degrees: 'Computer science; nursing; special education; social work',
    why: 'Home. Computing and nursing are the programs to look at.',
  },
  {
    rank: 8,
    id: '265f7d7e-0103-468e-852d-5c241ebd0148',
    unitid: '200800',
    name: 'University of Akron',
    state: 'OH',
    owed: '$15,827',
    degrees: 'Chemical, mechanical, civil, and biomedical engineering; finance; accounting',
    why: 'Paid co-op built into engineering. Costs more than Youngstown State.',
  },
  {
    rank: 9,
    id: '4440cf6f-e928-4ad6-b44b-f83f85d41453',
    unitid: '190725',
    name: 'Daemen University',
    state: 'NY',
    owed: '$14,325',
    degrees: 'Nursing; health science paths toward physical therapy and physician assistant',
    why: 'A private college whose aid brings it under $15,000.',
  },
  {
    rank: 10,
    id: 'e601debd-ff0c-4a47-9c92-894f74a6109d',
    unitid: '213349',
    name: 'Kutztown University',
    state: 'PA',
    owed: '$9,596',
    degrees: 'Communication design; teacher education; social work',
    why: 'Our creative pick, about an hour from the Poconos.',
  },
]
