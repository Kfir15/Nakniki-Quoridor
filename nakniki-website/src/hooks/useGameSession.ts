// src/hooks/useGameSession.ts
import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '../lib/socket.manager';
import { SOCKET_EVENTS as S } from '../constants/socket.constants';

export const useGameSession = (initialState: any, gameId: string, isAiGame: boolean) => {
    // store the game state
    const [gameState, setGameState] = useState(initialState);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    useEffect(() => {
        // get the user socket
        const socket = socketManager.getSocket();
        if (!socket) {
            setError("No active connection to the server.");
            return;
        }

        // update the game state
        const handleStateUpdate = (newState: any) => {
            setGameState(newState);
        };

        // handle invalid move
        const handleInvalidMove = (data: { message: string }) => {
            setError(data.message);
        };

        const handleGeneralError = (data: { message: string }) => {
            setError(data.message);
        };

        // listeners for events
        socket.on(S.SERVER.STATE_UPDATE, handleStateUpdate);
        socket.on(S.SERVER.INVALID_MOVE, handleInvalidMove);
        socket.on(S.SERVER.ERROR, handleGeneralError);

        return () => {
            socket.off(S.SERVER.STATE_UPDATE, handleStateUpdate);
            socket.off(S.SERVER.INVALID_MOVE, handleInvalidMove);
            socket.off(S.SERVER.ERROR, handleGeneralError);
        };
    }, [socketManager.getSocket()]);

    // move pawn 
    const movePawn = (r: number, c: number) => {
        // get the socket
        const socket = socketManager.getSocket();
        if (!socket) {
            setError("Lost connection to server.");
            return;
        }

        // get event name dynamic
        const eventName = isAiGame ? S.CLIENT.AI_MOVE_PAWN : S.CLIENT.MP_MOVE_PAWN;

        // send the action
        socket?.emit(eventName, {
            gameId: gameId,
            target: { r, c }
        });
    };

    // place wall
    const placeWall = (r: number, c: number, orient: 'h' | 'v') => {
        // get the socket
        const socket = socketManager.getSocket();
        if (!socket) {
            setError("Lost connection to server.");
            return;
        }

        // get event name dynamic
        const eventName = isAiGame ? S.CLIENT.AI_PLACE_WALL : S.CLIENT.MP_PLACE_WALL;

        // send the action
        socket?.emit(eventName, {
            gameId: gameId,
            pos: { r, c },
            orient
        });
    };

    return { gameState, movePawn, placeWall, error, clearError };
};