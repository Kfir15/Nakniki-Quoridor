const { supabase } = require('../lib/supabase');

const AuthRepository = {
    async signUp(email: string, password: string, username: string, avatar_url = null) {
        // try to sign up
        const { data, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    avatar_url: avatar_url
                }
            }
        });

        if (authError) throw authError;

        if (data.user) {
            // insert the user
            const { error: dbError } = await supabase
                .from('users')
                .insert({
                    id: data.user.id,
                    email: email,
                    username: username,
                    avatar_url: avatar_url,
                });

            if (dbError) throw dbError;
        }

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

    async getUser(token: string) {
        // get user data by token
        const { data, error } = await supabase.auth.getUser(token);

        // check if success
        if (error) throw error;

        // return  the user data
        return data.user;
    }
}

module.exports = AuthRepository;