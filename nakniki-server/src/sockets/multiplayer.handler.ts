import { Server, Socket } from 'socket.io';
import { MultiplayerService } from '../services/MultiplayerService';
import { Position, Orientation, GameStatus, SOCKET_EVENTS as S } from '@nakniki/shared';

export const MultiplayerHandlers = (io: Server, socket: Socket, multiplayerService: MultiplayerService) => {
    // get the user
    const userId = socket.data.user?.id;
    let activeLobbyCode: string | null = null;

    // create new lobby
    socket.on(S.CLIENT.CREATE_LOBBY, (data: { isPublic: boolean }) => {
        try {
            // create the looby
            const lobbyCode = multiplayerService.createLobby(userId, socket.id, data.isPublic);
            activeLobbyCode = lobbyCode;

            // join the socket and send to client the lobby code
            socket.join(lobbyCode);
            socket.emit(S.SERVER.LOBBY_CREATED, { lobbyCode })

            if (data.isPublic) {
                const lobbies = multiplayerService.getPublicLobbies();
                io.emit(S.SERVER.PUBLIC_LOBBIES_LIST, { lobbies });
            }
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Failed to create lobby." });
        }
    })

    // join lobby
    socket.on(S.CLIENT.JOIN_LOBBY, async (data: { lobbyCode: string }) => {
        try {
            // join the lobby
            const state = await multiplayerService.joinLobby(userId, socket.id, data.lobbyCode);

            // if success to join the lobby
            if (state) {
                // join the socket
                activeLobbyCode = data.lobbyCode;
                socket.join(data.lobbyCode);

                // send success to the player
                socket.emit(S.SERVER.LOBBY_JOINED, { lobbyCode: data.lobbyCode, state });

                // broadcast to players - game start!
                socket.to(data.lobbyCode).emit(S.SERVER.OPPONENT_JOINED, { state });

                const lobbies = multiplayerService.getPublicLobbies();
                io.emit(S.SERVER.PUBLIC_LOBBIES_LIST, { lobbies });
            }
            else {
                socket.emit(S.SERVER.LOBBY_ERROR, { message: "Lobby not found, full, or already started." })
            }

        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Failed to join lobby." });
        }
    })

    // return all the public lobbies
    socket.on(S.CLIENT.GET_PUBLIC_LOBBIES, () => {
        try {
            // get the lobbies and send them back
            const lobbies = multiplayerService.getPublicLobbies();
            socket.emit(S.SERVER.PUBLIC_LOBBIES_LIST, { lobbies });
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Failed to fetch public lobbies." });
        }
    })

    // handle move pawn
    socket.on(S.CLIENT.MP_MOVE_PAWN, async (data: { gameId: string, target: { r: number, c: number } }) => {
        try {
            // try to move the pawn
            const targetPos = new Position(data.target.r, data.target.c);
            const newState = await multiplayerService.processMovePawn(data.gameId, userId, targetPos);

            // if success
            if (newState) {
                // broadcast the new state
                io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, newState);

                // check if game over
                if (newState.status === GameStatus.FINISHED) {
                    activeLobbyCode = null;
                }
            }
            else {
                socket.emit(S.SERVER.INVALID_MOVE, { message: "Illegal pawn move." })
            }
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Failed to process move." });
        }
    })

    // handle wall placement
    socket.on(S.CLIENT.MP_PLACE_WALL, async (data: { gameId: string, pos: { r: number, c: number }, orient: Orientation }) => {
        try {
            // try to place the wall
            const wallPos = new Position(data.pos.r, data.pos.c);
            const newState = await multiplayerService.processPlaceWall(data.gameId, userId, wallPos, data.orient);

            // if success
            if (newState) {
                // broadcast the new state
                io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, newState);

                // check if game over
                if (newState.status === GameStatus.FINISHED) {
                    activeLobbyCode = null;
                }
            }
            else {
                socket.emit(S.SERVER.INVALID_MOVE, { message: "Illegal wall placement." });
            }
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Failed to place wall." });
        }
    })

    // handle timeout
    socket.on(S.CLIENT.MP_TURN_TIMEOUT, async (data: { gameId: string }) => {
        try {
            // change turn
            const newState = await multiplayerService.processTimeout(data.gameId, userId);

            // if success, broadcast new state
            if (newState) {
                io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, newState);
            }
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Failed to process timeout." });
        }
    })

    const handleQuit = async () => {
        if (activeLobbyCode) {
            const lobbyToQuit = activeLobbyCode;
            activeLobbyCode = null;
            socket.to(lobbyToQuit).emit(S.SERVER.GAME_ABANDONED);
            await multiplayerService.abandonGame(lobbyToQuit, userId);

            const updatedLobbies = multiplayerService.getPublicLobbies();
            io.emit(S.SERVER.PUBLIC_LOBBIES_LIST, { lobbies: updatedLobbies });
        }
    };

    // handle disconnect and abandon
    socket.on(S.CLIENT.MP_ABANDON_GAME, handleQuit);
    socket.on(S.CORE.DISCONNECT, handleQuit);
}