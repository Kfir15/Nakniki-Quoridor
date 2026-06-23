import { useState, useEffect, useCallback } from 'react';
import { sendGet, sendPost } from '../services/api';
import { ENDPOINTS as E } from '../constants/endpoints.constants';
import { useUser } from '../services/UserContext';

export interface TournamentSummary {
    id: string;
    name: string;
    size: number;
    status: string;
    created_at: string;
    participant_count: number;
}

export interface MyTournament { 
    id: string; 
    name: string; 
    status: string; 
    size: number; 
}

const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, REGISTERING: 1, FINISHED: 2, CANCELLED: 3 };

export const useTournamentLobby = () => {
    const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
    const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const clearError = useCallback(() => setError(null), []);

    const refreshTournaments = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await sendGet<TournamentSummary[]>(E.TOURNAMENTS.LIST, user?.token);  
            setTournaments(res.data);
            const myRes = await sendGet<{ tournament: MyTournament }[]>(E.TOURNAMENTS.MINE, user?.token);
            // Ordering myTournaments via status
            const mine = myRes.data
                .map(r => r.tournament)
                .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));
            setMyTournaments(mine);
        } catch (e: any) {
            setError(e?.response?.data?.error ?? 'Failed to load tournaments.');
        } finally {
            setIsRefreshing(false);
        }
    }, [user?.token]);

    const createTournament = useCallback(async (name: string, size: number) => {
        setIsCreating(true);
        try {
            await sendPost(E.TOURNAMENTS.CREATE, user?.token, {}, { name, size });
            await refreshTournaments();
        } catch (e: any) {
            setError(e?.response?.data?.error ?? 'Failed to create tournament.');
        } finally {
            setIsCreating(false);
        }
    }, [user?.token, refreshTournaments]);

    const joinTournament = useCallback(async (tournamentId: string) => {
        try {
            await sendPost(E.TOURNAMENTS.JOIN(tournamentId), user?.token);
            await refreshTournaments();
        } catch (e: any) {
            setError(e?.response?.data?.error ?? 'Failed to join tournament.');
        }
    }, [user?.token, refreshTournaments]);

    useEffect(() => {
        refreshTournaments();
    }, [refreshTournaments]);

    return {
        tournaments, myTournaments, refreshTournaments, createTournament, joinTournament,
        isRefreshing, isCreating, error, clearError,
    };
};