import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'school-checker',
      },
    },
    // Add timeout configuration
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
