import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '../lib/socket.manager';
import { SOCKET_EVENTS as S, type GameState, Orientation } from '@nakniki/shared';
import { hydrateGameState } from '../utils/gameHelpers';

export const useGameSession = (initialState: GameState, gameId: string, isAiGame: boolean) => {
    // store the game state
    const [gameState, setGameState] = useState<GameState>(() => hydrateGameState(initialState));
    const [error, setError] = useState<string | null>(null);
    const [opponentAbandoned, setOpponentAbandoned] = useState<boolean>(false);
    const [playersInfo, setPlayersInfo] = useState<{p1: any, p2: any} | null>(null);

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
            setGameState(hydrateGameState(newState));
        };

        // handle invalid move
        const handleInvalidMove = (data: { message: string }) => {
            setError(data.message);
        };

        const handleGeneralError = (data: { message: string }) => {
            setError(data.message);
        };

        const handleGameAbandoned = () => {
            setOpponentAbandoned(true);
        };

        const handlePlayersInfo = (data: any) => setPlayersInfo(data);

        // listeners for events
        socket.on(S.SERVER.STATE_UPDATE, handleStateUpdate);
        socket.on(S.SERVER.INVALID_MOVE, handleInvalidMove);
        socket.on(S.SERVER.ERROR, handleGeneralError);
        socket.on(S.SERVER.GAME_ABANDONED, handleGameAbandoned);
        socket.on(S.SERVER.players_info_update, handlePlayersInfo);

        if (!isAiGame) {
            socket.emit(S.CLIENT.request_players_info, { gameId });
        }

        return () => {
            socket.off(S.SERVER.STATE_UPDATE, handleStateUpdate);
            socket.off(S.SERVER.INVALID_MOVE, handleInvalidMove);
            socket.off(S.SERVER.ERROR, handleGeneralError);
            socket.off(S.SERVER.GAME_ABANDONED, handleGameAbandoned);
            socket.off(S.SERVER.players_info_update, handlePlayersInfo);
        };
    }, [gameId, isAiGame]);

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
    const placeWall = (r: number, c: number, orient: Orientation) => {
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

    const abandonGame = useCallback(() => {
        const socket = socketManager.getSocket();
        if (socket && !isAiGame) {
            socket.emit(S.CLIENT.MP_ABANDON_GAME);
        }
    }, [isAiGame]);

    return { gameState, movePawn, placeWall, error, clearError, abandonGame, opponentAbandoned, playersInfo };
};