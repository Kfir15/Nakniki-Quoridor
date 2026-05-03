import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';
import { SOCKET_EVENTS as S } from '@nakniki/shared';
import { socketManager } from '../lib/socket.manager';
import { useUser } from '../services/UserContext';

export const useAiGame = () => {
    const navigate = useNavigate();
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const clearError = useCallback(() => setError(null), []);

    // get the user socket
    const getOrConnectSocket = () => {
        // if the socket dont exist, create new one and return him
        let socket = socketManager.getSocket();
        if (!socket) {
            if (user?.token) {
                socket = socketManager.connect(user.token);
            } else {
                setError("There is a problem.")
            }
        }
        return socket;
    };

    const startAiGame = () => {
        // get the socket
        if (isInitializing) return;
        const socket = getOrConnectSocket();
        if (!socket) {
            setError("Failed to initialize socket connection.");
            return;
        }

        // start the game
        setIsInitializing(true);
        socket.emit(S.CLIENT.AI_START);
    };

    useEffect(() => {
        const socket = getOrConnectSocket();
        if (!socket) return;

        // handle game started event
        const handleGameStarted = (data: { gameId: string; state: any }) => {
            // navigate to the game screen
            setIsInitializing(false);
            const gamePath = ROUTES.GAME.replace(':gameId', data.gameId);
            navigate(gamePath, { state: { initialState: data.state, isHost: true } });
        };

        // handle error
        const handleError = (data: { message: string }) => {
            setIsInitializing(false);
            setError(data.message);
        };

        // listeners
        socket.on(S.SERVER.GAME_STARTED, handleGameStarted);
        socket.on(S.SERVER.ERROR, handleError);

        return () => {
            socket.off(S.SERVER.GAME_STARTED, handleGameStarted);
            socket.off(S.SERVER.ERROR, handleError);
        };
    }, [navigate]);

    return { startAiGame, isInitializing, error, clearError };
};