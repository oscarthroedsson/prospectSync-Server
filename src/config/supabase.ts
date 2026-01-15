import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

class SupabaseConfig {
  private static instance: SupabaseConfig;
  public client: SupabaseClient | null = null;

  private constructor() {
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      this.client = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  public static getInstance(): SupabaseConfig {
    if (!SupabaseConfig.instance) {
      SupabaseConfig.instance = new SupabaseConfig();
    }
    return SupabaseConfig.instance;
  }
}

export const supabase = SupabaseConfig.getInstance();
