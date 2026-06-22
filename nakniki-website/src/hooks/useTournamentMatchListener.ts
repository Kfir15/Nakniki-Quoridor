import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketManager } from '../lib/socket.manager';
import { SOCKET_EVENTS as S } from '@nakniki/shared';
import { ROUTES as R } from '../constants/routes.constants';
import { useUser } from '../services/UserContext';

export const useTournamentMatchListener = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        const socket = socketManager.getSocket();
        if (!socket) return;

        // Once the match is ready
        const handleMatchReady = (data: { gameId: string; isHost: boolean }) => {
            // Tell the server the user wants to connect to the game
            socket.emit(S.CLIENT.JOIN_TOURNAMENT_MATCH, { gameId: data.gameId });

            // When the server returns the game state, jump into the game.
            const handleJoined = (joined: { gameId: string; state: unknown }) => {
                // Unsubscribe from the socket since we got the message we needed, and we don't want any morer
                socket.off(S.SERVER.LOBBY_JOINED, handleJoined);
                navigate(R.GAME.replace(':gameId', joined.gameId), {
                    state: { initialState: joined.state, isHost: data.isHost },
                });
            };
            socket.on(S.SERVER.LOBBY_JOINED, handleJoined);
        };

        socket.on(S.SERVER.TOURNAMENT_MATCH_READY, handleMatchReady);

        // cleanup when this unmounts
        return () => {
            socket.off(S.SERVER.TOURNAMENT_MATCH_READY, handleMatchReady);
        };
    }, [navigate, user]);
};