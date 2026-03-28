const { supabase } = require('../lib/supabase');

const AuthRepository = {
    async signUp(email: string, password: string, username: string, avatar_url = null) {
        // try to sign up
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    avatar_url: avatar_url
                }
            }
        });

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    },

    async signIn(email: string, password: string) {
        // try to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        // check if success
        if (error) throw error;

        // return  the user data with JWT token
        return data;
    },

    async signOut(token: string) {
        // log out the user
        const { error } = await supabase.auth.admin.signOut(token);

        // check if success
        if (error) throw error;

        // return success
        return true;
    },

    async getUser(token: string) {
        // get user data by token
        const { data, error } = await supabase.auth.getUser(token);

        // check if success
        if (error) throw error;

        // return  the user data
        return data;
    }
}

module.exports = AuthRepository;