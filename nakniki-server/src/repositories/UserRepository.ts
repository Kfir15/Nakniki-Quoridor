const { supabase } = require('../lib/supabase');

const UserRepository = {
    // get user by his id
    async getUserById(id: string) {
        // check if the user exists
        const { data, error } = await supabase
            .from('users')
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
            .from('users')
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
            user = await this.getUserById(id);
        } catch (error) {
            throw error;
        }

        // update the user stats
        const { data, error } = await supabase
            .from('users')
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

    async getUserByUsername(username: string) {
        // serach user by username
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    },

    async getLeaderboard() {
        // get the leaderboard
        const { data, error } = await supabase
            .from('users')
            .select('username, elo_rating, total_games, total_wins')
            .order('elo_rating', { ascending: false });

        // check if success
        if (error) throw error;

        // return  the leaderboard
        return data;
    }
}

module.exports = UserRepository;