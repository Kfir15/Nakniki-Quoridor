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

export const useTournamentLobby = () => {
    const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
    const [myTournaments, setMyTournaments] = useState<TournamentSummary[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const clearError = useCallback(() => setError(null), []);

    const refreshTournaments = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await sendGet<TournamentSummary[]>(E.TOURNAMENTS.LIST, user?.token);
            const myRes = await sendGet<TournamentSummary[]>(E.TOURNAMENTS.MINE, user?.token);
            setTournaments(res.data);
            setMyTournaments(myRes.data);
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