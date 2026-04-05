import { Socket } from 'socket.io';
import { AuthRepository } from '../repositories/AuthRepository';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: any) => void) => {
    try {
        // get the token
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        // validate the token
        const user = await AuthRepository.getUser(token);
        if (!user) {
            return next(new Error("Authentication error: Invalid session"));
        }

        socket.data.user = user;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
};