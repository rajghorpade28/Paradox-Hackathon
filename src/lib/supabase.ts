import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isValidUrl = (url: string) => {
    try {
        if (!url || url.includes('your_supabase_url_here')) return false;
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Export a real client if keys are valid, otherwise a safe mock to prevent UI crashes
export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your_supabase_anon_key_here'))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }) }) }),
            update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        }),
        channel: () => ({
            on: () => ({
                subscribe: () => ({
                    unsubscribe: () => { }
                })
            })
        }),
    } as any;
