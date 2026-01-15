import { SupabaseClient } from "@supabase/supabase-js";
declare class SupabaseConfig {
    private static instance;
    client: SupabaseClient | null;
    private constructor();
    static getInstance(): SupabaseConfig;
}
export declare const supabase: SupabaseConfig;
export {};
//# sourceMappingURL=supabase.d.ts.map