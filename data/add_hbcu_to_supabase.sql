-- Run this in your Supabase SQL editor (supabase.com → project → SQL Editor)
-- Adds hbcu boolean column to the schools table and populates all verified HBCUs
-- Unit IDs sourced directly from crown_hub_colleges.csv — verified against school names

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS hbcu boolean DEFAULT false;

-- Reset any previously incorrect tags
UPDATE schools SET hbcu = false;

-- Set confirmed HBCUs by verified IPEDS unit ID
UPDATE schools
SET hbcu = true
WHERE unitid IN (
  -- Alabama
  '100654',  -- Alabama A&M University
  '100724',  -- Alabama State University
  '101675',  -- Miles College
  '101912',  -- Oakwood University
  '102270',  -- Stillman College
  '102298',  -- Talladega College
  '102377',  -- Tuskegee University

  -- Arkansas
  '106306',  -- Arkansas Baptist College
  '107600',  -- Philander Smith University

  -- California
  '117557',  -- Lincoln University (Oakland, CA)

  -- Delaware
  '130934',  -- Delaware State University

  -- District of Columbia
  '131399',  -- University of the District of Columbia
  '131520',  -- Howard University

  -- Florida
  '132602',  -- Bethune-Cookman University
  '133526',  -- Edward Waters University
  '133650',  -- Florida Agricultural and Mechanical University
  '133979',  -- Florida Memorial University

  -- Georgia
  '138947',  -- Clark Atlanta University
  '139719',  -- Fort Valley State University
  '140553',  -- Morehouse College
  '140571',  -- Morris Brown College
  '140960',  -- Savannah State University
  '141060',  -- Spelman College

  -- Kentucky
  '157058',  -- Kentucky State University
  '461759',  -- Simmons College of Kentucky

  -- Louisiana
  '158802',  -- Dillard University
  '159009',  -- Grambling State University
  '160621',  -- Southern University and A&M College
  '160630',  -- Southern University at New Orleans
  '160649',  -- Southern University at Shreveport
  '160904',  -- Xavier University of Louisiana

  -- Maryland
  '162007',  -- Bowie State University
  '162283',  -- Coppin State University
  '163338',  -- University of Maryland Eastern Shore
  '163453',  -- Morgan State University

  -- Mississippi
  '175342',  -- Alcorn State University
  '175519',  -- Coahoma Community College
  '175856',  -- Jackson State University
  '176044',  -- Mississippi Valley State University
  '176318',  -- Rust College
  '176406',  -- Tougaloo College

  -- Missouri
  '177551',  -- Harris-Stowe State University
  '177940',  -- Lincoln University (MO)

  -- North Carolina
  '197993',  -- Bennett College
  '198507',  -- Elizabeth City State University
  '198543',  -- Fayetteville State University
  '198756',  -- Johnson C Smith University
  '198862',  -- Livingstone College
  '199102',  -- North Carolina A&T State University
  '199157',  -- North Carolina Central University
  '199582',  -- Saint Augustine's University
  '199643',  -- Shaw University
  '199999',  -- Winston-Salem State University

  -- Ohio
  '201690',  -- Central State University
  '206491',  -- Wilberforce University

  -- Oklahoma
  '207209',  -- Langston University

  -- Pennsylvania
  '211608',  -- Cheyney University of Pennsylvania
  '213598',  -- Lincoln University (PA)

  -- South Carolina
  '217624',  -- Allen University
  '217721',  -- Benedict College
  '217873',  -- Claflin University
  '217989',  -- Denmark Technical College
  '218399',  -- Morris College
  '218919',  -- Voorhees University

  -- Tennessee
  '220181',  -- Fisk University
  '220598',  -- Lane College
  '220604',  -- Le Moyne-Owen College
  '221838',  -- Tennessee State University

  -- Texas
  '225575',  -- Huston-Tillotson University
  '225885',  -- Jarvis Christian University
  '227429',  -- Paul Quinn College
  '227526',  -- Prairie View A&M University
  '228486',  -- Southwestern Christian College
  '228884',  -- Texas College
  '229063',  -- Texas Southern University

  -- Virginia
  '232265',  -- Hampton University
  '232937',  -- Norfolk State University
  '234137',  -- Virginia University of Lynchburg
  '234155',  -- Virginia State University
  '234164',  -- Virginia Union University

  -- West Virginia
  '237215',  -- Bluefield State University
  '237899'   -- West Virginia State University
);

-- Verify: shows count and names of tagged schools
SELECT unitid, name FROM schools WHERE hbcu = true ORDER BY name;
