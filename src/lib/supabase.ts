import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type School = {
  id: string
  unitid: string
  name: string
  city: string
  state: string
  control: number
  size: number
  website_url: string
  npc_url: string
  cost_of_attendance: number
  tuition_in_state: number
  tuition_out_state: number
  no_loan_policy: boolean
  meets_full_need: boolean
  travel_type: string
  annual_travel_cost: number
  gap_0_30k: number
  gap_30_48k: number
  gap_48_75k: number
  gap_75_110k: number
  gap_110k_plus: number
  gap_severity: string
  grad_rate_4yr: number
  grad_rate_pell: number
  median_debt: number
  median_earnings_10yr: number
  admission_rate: number
  sat_read_25: number
  sat_read_75: number
  sat_math_25: number
  sat_math_75: number
  act_25: number
  act_75: number
}
