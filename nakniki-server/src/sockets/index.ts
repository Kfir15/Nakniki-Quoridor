import { Server } from 'socket.io';
import { AIHandlers } from './ai.handler';
import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware';
import { MultiplayerHandlers } from './multiplayer.handler';
import { SOCKET_EVENTS as S } from '@nakniki/shared';
import { multiplayerService, aiService} from '../services';


export const setupSockets = (io: Server) => {

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