import { Server, Socket } from 'socket.io';
import { AIGameService } from '../services/AIGameService';
import { Position, Orientation, GameStatus, SOCKET_EVENTS as S } from '@nakniki/shared';

export const AIHandlers = (io: Server, socket: Socket, aiService: AIGameService) => {
    // get the user
    const userId = socket.data.user?.id;
    let activeGameId: string | null = null;

    // on start new game
    socket.on(S.CLIENT.AI_START, async () => {
        try {
            // clean up existing game
            if (activeGameId) {
                await aiService.abandonGame(activeGameId);
                activeGameId = null;
            }

            // create new ai game
            const { gameId, state } = await aiService.startAIGame(userId, socket.id);
            activeGameId = gameId;

            // join the socket to the game and send back the state
            socket.join(gameId);
            socket.emit(S.SERVER.GAME_STARTED, { gameId, state });
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "Could not initialize AI game." });
        }
    })

    // on move pawn action
    socket.on(S.CLIENT.AI_MOVE_PAWN, async (data: { gameId: string, target: { r: number, c: number } }) => {
        try {
            // try to move the pawn
            const targetPos = new Position(data.target.r, data.target.c);
            const newState = await aiService.processHumanMovePawn(data.gameId, targetPos)

            // if legall move
            if (newState) {
                // send to player the new state
                io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, newState);

                // trigger ai move if game in process
                if (newState.status === GameStatus.IN_PROGRESS) {
                    const aiNewState = await aiService.triggerAITurn(data.gameId);

                    // send to player the new state
                    if (aiNewState) {
                        io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, aiNewState);

                        if (aiNewState.status === GameStatus.FINISHED) {
                            activeGameId = null;
                        }
                    }
                }
                // else, user won
                else {
                    activeGameId = null;
                }
            }
            // else, this is illegal move! 
            else {
                socket.emit(S.SERVER.INVALID_MOVE, { message: "Illegal pawn move." });
            }
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "AI Engine failed to respond." });
        }
    })

    // on place wall action
    socket.on(S.CLIENT.AI_PLACE_WALL, async (data: { gameId: string, pos: { r: number, c: number }, orient: Orientation }) => {
        try {
            // try to place the wall
            const wallPos = new Position(data.pos.r, data.pos.c);
            const humanMoveState = await aiService.processHumanPlaceWall(data.gameId, wallPos, data.orient);

            // if legall wall
            if (humanMoveState) {
                // send to player the new state
                io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, humanMoveState);

                // trigger ai move if game in process
                if (humanMoveState.status === GameStatus.IN_PROGRESS) {
                    const aiNewState = await aiService.triggerAITurn(data.gameId);

                    // send to player the new state
                    if (aiNewState) {
                        io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, aiNewState);

                        if (aiNewState.status === GameStatus.FINISHED) {
                            activeGameId = null;
                        }
                    }
                }
                // else, user won
                else {
                    activeGameId = null;
                }
            }
            // else, this is illegal wall! 
            else {
                socket.emit(S.SERVER.INVALID_MOVE, { message: "Illegal wall placement." });
            }
        } catch (error) {
            socket.emit(S.SERVER.ERROR, { message: "AI Engine failed to respond." });
        }
    });

    socket.on(S.CLIENT.AI_TURN_TIMEOUT, async (data: { gameId: string }) => {
        try {
            const newState = await aiService.processHumanTimeout(data.gameId);

            if (newState) {
                // notify client the turn is skiped
                io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, newState);

                // trigger the ai to make a move
                if (newState.status === GameStatus.IN_PROGRESS) {
                    const aiMoveState = await aiService.triggerAITurn(data.gameId);
                    if (aiMoveState) {
                        // send to player the  ai move
                        io.to(data.gameId).emit(S.SERVER.STATE_UPDATE, aiMoveState);
                        if (aiMoveState.status === GameStatus.FINISHED) activeGameId = null;
                    }
                }
            }
        } catch (error) {
            console.error("AI Timeout Error:", error);
            socket.emit(S.SERVER.ERROR, { message: "Failed to process turn timeout." });
        }
    });

    const handleQuit = async () => {
        try {
            if (activeGameId) {
                const gameToQuit = activeGameId;
                activeGameId = null;

                socket.emit(S.SERVER.GAME_ABANDONED);
                await aiService.abandonGame(gameToQuit);
            }
        } catch (error) {
            console.error("Error abandoning game:", error);
        }
    };

    // handle abandon and disconnect game
    socket.on(S.CLIENT.ABANDON_GAME, handleQuit);
    socket.on(S.CORE.DISCONNECT, handleQuit);
}