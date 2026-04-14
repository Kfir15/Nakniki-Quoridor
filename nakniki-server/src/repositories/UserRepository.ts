import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';

export const UserRepository = {
    // get user by his id
    async getUserById(id: string) {
        // check if the user exists
        const { data, error } = await supabase
            .from(DB.TABLES.USERS)
            .select('*')
            .eq('id', id)
            .single();

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    },

    // update profile
    async updateProfile(id: string, updates: { username?: string, avatar_url?: string }) {
        // check if the user exists
        const { data, error } = await supabase
            .from(DB.TABLES.USERS)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    },

    // update user elo, total games, total wins
    async updateStatsAfterGame(id: string, newElo: number, won: boolean) {
        // check if the user exists
        let user;
        try {
            user = await UserRepository.getUserById(id);
        } catch (error) {
            throw error;
        }

        // update the user stats
        const { data, error } = await supabase
            .from(DB.TABLES.USERS)
            .update({
                elo_rating: newElo,
                total_games: user.total_games + 1,
                total_wins: won ? user.total_wins + 1 : user.total_wins
            })
            .eq('id', id)
            .select()
            .single();

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    },

    async searchUsers(prefix: string) {
        // serach users by prefix
        const { data, error } = await supabase
            .from(DB.TABLES.USERS)
            .select('id, username, avatar_url, elo_rating, total_games, total_wins, created_at')
            .ilike('username', `${prefix}%`)
            .limit(DB.LIMITS.SEARCH_USERS);

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    },

    async getLeaderboard() {
        // get the leaderboard
        const { data, error } = await supabase
            .from(DB.TABLES.USERS)
            .select('id, username, avatar_url, elo_rating, total_games, total_wins, created_at')
            .order('elo_rating', { ascending: false });

        // check if success
        if (error) throw error;

        // return  the leaderboard
        return data;
    },

    // get the player rank
    async getUserRankBucket(userElo: number): Promise<{ isTop: boolean, rank: string }> {
        // count how many players got elo higher than me
        const { count, error } = await supabase
            .from(DB.TABLES.USERS)
            .select('id', { count: 'exact', head: true })
            .gt('elo_rating', userElo);

        // check if success
        if (error) throw error;

        // return the rank
        const exactRank = (count || 0) + 1;
        return this.formatRank(exactRank);
    },

    // get the rank string base on the rank
    formatRank(rank: number): { isTop: boolean, rank: string } {
        if (rank <= 15) return { isTop: false, rank: `${rank}` };
        if (rank <= 50) return { isTop: true, rank: "50" };
        if (rank <= 100) return { isTop: true, rank: "100" };
        if (rank <= 500) return { isTop: true, rank: "500" };
        if (rank <= 1000) return { isTop: true, rank: "1k" };
        if (rank <= 5000) return { isTop: true, rank: "5k" };
        if (rank <= 10000) return { isTop: true, rank: "10k" };
        return { isTop: false, rank: "Unranked" };
    }
}