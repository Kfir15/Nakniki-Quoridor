import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketManager } from '../lib/socket.manager';
import { SOCKET_EVENTS as S, GameStatus } from '@nakniki/shared';
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
            // Tell the server we want to check in to the game
            socket.emit(S.CLIENT.JOIN_TOURNAMENT_MATCH, { gameId: data.gameId });

            // Only ever enter the game with an already-STARTED state, so both players
            // arrive in sync (nobody sits frozen in WAITING). This listener is mounted
            // app-wide, so — unlike GamePage — it cannot miss the GAME_STARTED event.
            let navigated = false;
            const enterGame = (state: unknown) => {
                if (navigated) return;
                navigated = true;
                socket.off(S.SERVER.LOBBY_JOINED, handleJoined);
                socket.off(S.SERVER.GAME_STARTED, handleStarted);
                navigate(R.GAME.replace(':gameId', data.gameId), {
                    state: { initialState: state, isHost: data.isHost, isAiGame: false },
                });
            };

            // Our check-in reply. If we were the 2nd player the game is already live —
            // enter now. If we were 1st, the state is still WAITING, so wait for GAME_STARTED.
            const handleJoined = (joined: { gameId: string; state: any }) => {
                if (joined.state?.status === GameStatus.IN_PROGRESS) enterGame(joined.state);
            };

            // Fires when the 2nd player checks in and the game goes live (emitted to the room).
            const handleStarted = (started: { gameId: string; state: any }) => {
                enterGame(started.state);
            };

            socket.on(S.SERVER.LOBBY_JOINED, handleJoined);
            socket.on(S.SERVER.GAME_STARTED, handleStarted);
        };

        socket.on(S.SERVER.TOURNAMENT_MATCH_READY, handleMatchReady);

        // cleanup when this unmounts
        return () => {
            socket.off(S.SERVER.TOURNAMENT_MATCH_READY, handleMatchReady);
        };
    }, [navigate, user]);
};