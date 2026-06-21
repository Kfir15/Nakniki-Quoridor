import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketManager } from '../lib/socket.manager';
import { SOCKET_EVENTS as S } from '@nakniki/shared';
import { ROUTES as R } from '../constants/routes.constants';
import { useUser } from '../services/UserContext';

export const useMultiplayerLobby = () => {
    const navigate = useNavigate();
    const [lobbies, setLobbies] = useState<{ lobbyCode: string, hostId: string }[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();
    const clearError = useCallback(() => setError(null), []);
    const pendingLobbyType = useRef<'public' | 'private'>('private');

    // request empty lobbies
    const refreshLobbies = useCallback(() => {
        // get the socket
        const socket = socketManager.getSocket();
        if (!socket) {
            setError("Not connected to server.");
            return;
        }

        // request the lobbies
        setIsRefreshing(true);
        socket.emit(S.CLIENT.GET_PUBLIC_LOBBIES);
    }, []);

    // create new lobby
    const createLobby = useCallback((isPublic: boolean) => {
        // get the socket
        const socket = socketManager.getSocket();
        if (!socket) return setError("Not connected to server.");
        pendingLobbyType.current = isPublic ? 'public' : 'private';

        // create the looby
        setIsCreating(true);
        socket.emit(S.CLIENT.CREATE_LOBBY, { isPublic });
    }, []);

    // join lobby
    const joinLobby = useCallback((lobbyCode: string) => {
        // get the socket
        const socket = socketManager.getSocket();
        if (!socket) return setError("Not connected to server.");

        // join the lobby
        setIsCreating(true);
        socket.emit(S.CLIENT.JOIN_LOBBY, { lobbyCode });
    }, []);

    useEffect(() => {
        // get the socket
        const socket = socketManager.getSocket();
        if (!socket) return;

        // refresh empty lobbies always
        if (socket.connected) {
            refreshLobbies();
        } else {
            socket.on(S.CORE.CONNECTION, () => refreshLobbies());
        }

        // handke server response to empty lobbies
        const handleLobbyList = (data: { lobbies: any[] }) => {
            setLobbies(data.lobbies);
            setIsRefreshing(false);
        };

        // handle server response to create lobby
        const handleLobbyCreated = (data: { lobbyCode: string }) => {
            setIsCreating(false);
            const waitingPath = R.WAITING
                .replace(':lobbyType', pendingLobbyType.current)
                .replace(':gameId', data.lobbyCode);
            navigate(waitingPath);
        };

        // handle server response to join lobby
        const handleLobbyJoined = (data: { lobbyCode: string, state: any }) => {
            setIsCreating(false);
            const gamePath = R.GAME.replace(':gameId', data.lobbyCode);
            navigate(gamePath, { state: { initialState: data.state, isHost: false } });
        };

        // handle lobbies error
        const handleLobbyError = (data: { message: string }) => {
            setIsRefreshing(false);
            setIsCreating(false);
            setError(data.message);
        };

        // listeners
        socket.on(S.SERVER.PUBLIC_LOBBIES_LIST, handleLobbyList);
        socket.on(S.SERVER.LOBBY_CREATED, handleLobbyCreated);
        socket.on(S.SERVER.LOBBY_JOINED, handleLobbyJoined);
        socket.on(S.SERVER.LOBBY_ERROR, handleLobbyError);

        return () => {
            socket.off(S.SERVER.PUBLIC_LOBBIES_LIST, handleLobbyList);
            socket.off(S.SERVER.LOBBY_CREATED, handleLobbyCreated);
            socket.off(S.SERVER.LOBBY_JOINED, handleLobbyJoined);
            socket.off(S.SERVER.LOBBY_ERROR, handleLobbyError);
        };
    }, [navigate, refreshLobbies, user]);

    return { lobbies, createLobby, joinLobby, refreshLobbies, isRefreshing, isCreating, error, clearError };
};