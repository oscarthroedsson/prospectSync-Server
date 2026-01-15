"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
class SupabaseConfig {
    static instance;
    client = null;
    constructor() {
        if (env_1.env.SUPABASE_URL && env_1.env.SUPABASE_SERVICE_ROLE_KEY) {
            this.client = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        }
    }
    static getInstance() {
        if (!SupabaseConfig.instance) {
            SupabaseConfig.instance = new SupabaseConfig();
        }
        return SupabaseConfig.instance;
    }
}
exports.supabase = SupabaseConfig.getInstance();
//# sourceMappingURL=supabase.js.map