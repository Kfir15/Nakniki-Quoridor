import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRepository } from '../repositories/AuthRepository';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    // get the token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: "Access denied. No token provided."
        });
    }

    try {
        // get the user by the token
        const user = await AuthRepository.getUser(token);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: "Invalid or expired session."
            });
        }

        //move to the next step
        req.user = user;
        next();
    } catch (error: any) {
        // a thrown token-verification error almost always means a bad/expired 
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid or expired session." });
    }
};