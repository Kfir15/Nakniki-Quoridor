import { Server } from 'socket.io';
import { GameManager } from '../game_model/GameManager';
import { AIGameService } from '../services/AIGameService';
import { AIHandlers } from './ai.handler';
import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware';
import { MultiplayerService } from '../services/MultiplayerService';
import { MultiplayerHandlers } from './multiplayer.handler';
import { SOCKET_EVENTS as S } from '../constants/socket.constants';

export const setupSockets = (io: Server) => {
    // initialize the manager and services
    const gameManager = new GameManager();
    const aiService = new AIGameService(gameManager);
    const multiplayerService = new MultiplayerService(gameManager);

    // add auth middleware
    io.use(socketAuthMiddleware);

    // on connection
    io.on(S.CORE.CONNECTION, (socket) => {
        // connect the user
        const username = socket.data.user?.user_metadata?.username || "Player";
        console.log(`Connected: ${username} (${socket.id})`);

        AIHandlers(io, socket, aiService);
        MultiplayerHandlers(io, socket, multiplayerService);

        socket.on(S.CORE.DISCONNECT, () => {
            console.log(`Disconnected: ${socket.id}`);
        });
    });
};