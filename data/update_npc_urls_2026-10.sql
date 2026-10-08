-- Run this in your Supabase SQL editor.
--
-- Commonwealth University of Pennsylvania (Bloomsburg, Lock Haven, Mansfield)
-- moved its net price calculator. The calconic link stored in `schools`
-- no longer loads. New link confirmed by Jeff on 2026-10-08.

UPDATE schools
SET npc_url = 'https://app.meadowfi.com/commonwealthu'
WHERE unitid = '498562';

-- Check the result:
SELECT unitid, name, npc_url FROM schools WHERE unitid = '498562';
