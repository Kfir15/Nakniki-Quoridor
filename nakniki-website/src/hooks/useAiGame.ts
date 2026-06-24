import { useState, useEffect, useCallback, useRef } from 'react';
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
    const startedRef = useRef(false);   // did THIS hook start an AI game?

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
        startedRef.current = true;
        setIsInitializing(true);
        socket.emit(S.CLIENT.AI_START);
    };

    useEffect(() => {
        const socket = getOrConnectSocket();
        if (!socket) return;

        // handle game started event
        const handleGameStarted = (data: { gameId: string; state: any }) => {
            // GAME_STARTED is shared by AI / MP / tournament games. Only react if WE
            // started an AI game — otherwise we'd hijack a tournament match's navigation.
            if (!startedRef.current) return;
            startedRef.current = false;

            // navigate to the game screen
            setIsInitializing(false);
            const gamePath = ROUTES.GAME.replace(':gameId', data.gameId);
            navigate(gamePath, { state: { initialState: data.state, isHost: true, isAiGame: true } });
        };

        // handle error
        const handleError = (data: { message: string }) => {
            startedRef.current = false;
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