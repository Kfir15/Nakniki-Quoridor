import { supabase } from '../lib/supabase';

export const AuthRepository = {
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