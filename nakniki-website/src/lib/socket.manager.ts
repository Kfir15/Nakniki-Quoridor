import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socket.constants';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket | null = null;

    private constructor() { }

    // get the socket manager
    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public connect(token: string): Socket {
        if (!this.socket) {
            const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3174';

            this.socket = io(URL, {
                auth: { token },
                transports: ['websocket'],
                reconnectionAttempts: 5,
            });

            // handle connection
            this.socket.on(SOCKET_EVENTS.CORE.CONNECTION, () => {
                console.log('🟢 Socket connected:', this.socket?.id);
            });

            // handle disconnect
            this.socket.on(SOCKET_EVENTS.CORE.DISCONNECT, (reason) => {
                console.log('🔴 Socket disconnected:', reason);
            });

            // handle connect error
            this.socket.on(SOCKET_EVENTS.CORE.CONNECTION_ERROR, (err) => {
                console.error('❌ Socket connection error:', err.message);
            });
        }
        return this.socket;
    }

    public getSocket(): Socket | null {
        // return this socket
        return this.socket;
    }

    public disconnect(): void {
        // handle disconnect
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketManager = SocketManager.getInstance();