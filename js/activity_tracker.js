import { supabase } from './supabase_client.js';

/**
 * Tracks a user activity and awards EXP points.
 * Writes to user_profiles (exp) — silently no-ops if something fails.
 * @param {string} userId - The user's UUID from Supabase Auth
 * @param {string} action - A short label e.g. 'upload_file'
 * @param {number} expAwarded - How many EXP points to add
 */
export async function trackActivity(userId, action, expAwarded = 0) {
    if (!userId) return;

    try {
        // Increment EXP in user_profiles using a raw SQL RPC call approach
        // We do a read-then-write since Supabase JS doesn't support increment natively
        const { data: profile, error: fetchErr } = await supabase
            .from('user_profiles')
            .select('exp')
            .eq('id', userId)
            .single();

        if (fetchErr) throw fetchErr;

        const newExp = (profile?.exp ?? 0) + expAwarded;

        const { error: updateErr } = await supabase
            .from('user_profiles')
            .update({ exp: newExp, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateErr) throw updateErr;

        // Update EXP display in UI if visible
        const expEl = document.getElementById('user-exp');
        if (expEl) expEl.textContent = newExp;

    } catch (err) {
        console.warn(`[trackActivity] Could not award EXP for "${action}":`, err.message);
    }
}
