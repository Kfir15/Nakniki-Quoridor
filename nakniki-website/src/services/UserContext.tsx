import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { type User } from '@supabase/supabase-js';

export type AppUser = User & {
    username?: string;
    token?: string;
};

interface UserContextValue {
    user: AppUser | null;
    logOut: () => Promise<void>;
    isLoading: boolean;
}

const UserAuthContext = createContext<UserContextValue | undefined>(undefined);

// custom hook for accessing the user context
export const useUser = () => {
    const context = useContext(UserAuthContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};

// provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // logout
    const logOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session) {
                    setUser({ ...session.user, token: session.access_token } as AppUser);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // listener for changing the token
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`Auth Event: ${event}`);

            if (session) {
                setUser({ ...session.user, token: session.access_token } as AppUser);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <UserAuthContext.Provider value={{ user, logOut, isLoading }}>
            {children}
        </UserAuthContext.Provider>
    );
};