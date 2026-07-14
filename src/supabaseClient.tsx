import { createClient } from "@supabase/supabase-js";

// Clean base URL and secret anon key matching your project configuration
const supabaseUrl = "https://kebdkkfgzcjejlubfsqf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYmRra2ZnemNqZWpsdWJmc3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTkwODIsImV4cCI6MjA5NTI3NTA4Mn0.HMkBaYIswLTCwJS7jVl1DCDl7EsLqpp0QST15-xwxZI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);