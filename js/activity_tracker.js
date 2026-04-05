import { supabase } from './supabase_client.js';

export async function trackActivity(userId, actionType, expGained = 0) {
    try {
        // 1. Log the activity
        const { error: logError } = await supabase.from('activity_logs').insert({
            user_id: userId,
            action_type: actionType
        });

        if (logError) console.error('Error logging activity:', logError);

        // 2. Update user's contribution score
        if (expGained > 0) {
            // First we need to get the current EXP
            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .select('contribution_score')
                .eq('id', userId)
                .single();

            let newScore = expGained;
            if (userRecord && !userError) {
                newScore += userRecord.contribution_score || 0;
            }

            // Upsert the new score
            const { error: updateError } = await supabase
                .from('users')
                .upsert({ 
                    id: userId, 
                    contribution_score: newScore 
                });

            if (updateError) console.error('Error updating score:', updateError);
            
            // Re-render UI if element exists
            const userExpDisplay = document.getElementById('user-exp');
            if (userExpDisplay) {
                userExpDisplay.textContent = newScore;
            }
        }

    } catch (error) {
        console.error('Activity Tracking Failed:', error);
    }
}

// Fetch initial EXP when dashboard loads
export async function loadInitialExp() {
    const userExpDisplay = document.getElementById('user-exp');
    if (!userExpDisplay) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('users')
            .select('contribution_score')
            .eq('id', user.id)
            .single();

        if (data) {
            userExpDisplay.textContent = data.contribution_score || 0;
        }
    } catch (err) {
        // User might not be in DB yet, ignore.
        console.log('No initial exp found');
    }
}

// Auto-run if we are on dashboard
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        loadInitialExp();
    });
}
