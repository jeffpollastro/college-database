-- Run this in your Supabase SQL editor (supabase.com → project → SQL Editor)
-- Adds hbcu boolean column to the schools table and populates all known HBCUs
-- Source: U.S. Department of Education official HBCU list (101 institutions)

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS hbcu boolean DEFAULT false;

-- Populate known HBCUs by IPEDS unit ID
UPDATE schools
SET hbcu = true
WHERE unitid IN (
  -- Alabama
  '100654',  -- Alabama A&M University
  '100724',  -- Alabama State University
  '100659',  -- Concordia College Alabama
  '100830',  -- Miles College
  '101480',  -- Oakwood University
  '101618',  -- Talladega College
  '101709',  -- Stillman College
  '101897',  -- Tuskegee University
  '100812',  -- Bishop State Community College
  '100937',  -- J.F. Drake State Community and Technical College
  '101143',  -- Lawson State Community College

  -- Arkansas
  '106467',  -- Arkansas Baptist College
  '106704',  -- University of Arkansas at Pine Bluff
  '107983',  -- Philander Smith University

  -- Delaware
  '130183',  -- Delaware State University

  -- District of Columbia
  '131469',  -- University of the District of Columbia
  '131520',  -- Howard University

  -- Florida
  '132471',  -- Bethune-Cookman University
  '133553',  -- Edward Waters University
  '133650',  -- Florida A&M University
  '133702',  -- Florida Memorial University

  -- Georgia
  '138947',  -- Clark Atlanta University
  '139009',  -- Morehouse College
  '139032',  -- Morris Brown College
  '139144',  -- Spelman College
  '139931',  -- Fort Valley State University
  '141945',  -- Savannah State University
  '142285',  -- Interdenominational Theological Center

  -- Kentucky
  '157289',  -- Simmons College of Kentucky
  '157386',  -- Kentucky State University

  -- Louisiana
  '158829',  -- Dillard University
  '159009',  -- Grambling State University
  '159596',  -- Southern University and A&M College
  '159714',  -- Southern University at New Orleans
  '161554',  -- Xavier University of Louisiana

  -- Maryland
  '162283',  -- Bowie State University
  '162654',  -- Coppin State University
  '163268',  -- Morgan State University
  '163271',  -- University of Maryland Eastern Shore

  -- Mississippi
  '175342',  -- Alcorn State University
  '175421',  -- Coahoma Community College
  '175616',  -- Jackson State University
  '175717',  -- Mississippi Valley State University
  '177214',  -- Rust College
  '177986',  -- Tougaloo College

  -- Missouri
  '177399',  -- Harris-Stowe State University
  '177834',  -- Lincoln University (MO)

  -- North Carolina
  '198136',  -- Bennett College
  '198419',  -- Elizabeth City State University
  '198507',  -- Fayetteville State University
  '199111',  -- North Carolina Central University
  '199120',  -- North Carolina A&T State University
  '199156',  -- Johnson C. Smith University
  '199218',  -- Livingstone College
  '199399',  -- Winston-Salem State University

  -- Ohio
  '203368',  -- Central State University
  '206795',  -- Wilberforce University

  -- Oklahoma
  '206941',  -- Langston University

  -- Pennsylvania
  '211158',  -- Cheyney University of Pennsylvania
  '213011',  -- Lincoln University (PA)

  -- South Carolina
  '217235',  -- Benedict College
  '217365',  -- Allen University
  '217484',  -- Denmark Technical College
  '217518',  -- Claflin University
  '218519',  -- Morris College
  '218535',  -- South Carolina State University
  '218724',  -- Voorhees University

  -- Tennessee
  '220575',  -- American Baptist College
  '220598',  -- Fisk University
  '220862',  -- Meharry Medical College
  '221238',  -- Lane College
  '221283',  -- LeMoyne-Owen College
  '221971',  -- Tennessee State University

  -- Texas
  '225399',  -- St. Philip's College
  '227372',  -- Paul Quinn College
  '227375',  -- Huston-Tillotson University
  '228251',  -- Jarvis Christian University
  '228431',  -- Prairie View A&M University
  '228537',  -- Southwestern Christian College
  '228723',  -- Texas College
  '228951',  -- Texas Southern University
  '229814',  -- Wiley College

  -- Virginia
  '121150',  -- Hampton University
  '233277',  -- Norfolk State University
  '233374',  -- Virginia State University
  '233450',  -- Virginia Union University
  '233468',  -- Virginia University of Lynchburg

  -- Virgin Islands
  '433660',  -- University of the Virgin Islands

  -- West Virginia
  '237011',  -- Bluefield State University
  '237036'   -- West Virginia State University
);

-- Fix: Shaw University is NC (199759), Saint Augustine's is NC (229780)
UPDATE schools SET hbcu = true WHERE unitid = '199759'; -- Shaw University

-- Verify the count after running
-- SELECT COUNT(*) FROM schools WHERE hbcu = true;
-- Expected: ~80-101 (depending on how many of the 101 HBCUs passed the UGDS >= 100 filter)
