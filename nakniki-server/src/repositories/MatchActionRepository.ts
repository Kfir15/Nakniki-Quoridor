import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';

export const MatchActionRepository = {
    // insert game actions
    async insertActions(actions: any[]): Promise<boolean> {
        if (!actions || actions.length === 0) return false;

        const { data, error } = await supabase
            .from(DB.TABLES.MATCH_ACTIONS)
            .insert(actions)

        // check if success
        if (error) throw error;

        return true;
    },

    async getMatchActions(matchId: string) {
        // get the actions sorted
        const { data, error } = await supabase
            .from(DB.TABLES.MATCH_ACTIONS)
            .select('*')
            .eq('match_id', matchId)
            .order('turn_number', { ascending: true });

        if (error) throw error;
        return data;
    }
}