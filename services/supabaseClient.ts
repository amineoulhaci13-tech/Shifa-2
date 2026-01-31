import { createClient } from '@supabase/supabase-js';

// استخدام بيانات المشروع المحددة بدقة
const supabaseUrl = 'https://fwqaypbcderfrqhyyfqy.supabase.co';
const supabaseAnonKey = 'sb_publishable_Y-mpW4j2RSCiUBCkgbTS4w_rm5AIkYG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
