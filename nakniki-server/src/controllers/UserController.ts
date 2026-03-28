import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { UNIQUE_VIOLATION } from 'pg-error-codes';
const UserRepository = require('../repositories/UserRepository');

const UserController = {
    async getUser(req: Request, res: Response) {
        try {
            // get the user id from the request
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            // get the user from the database
            const user = await UserRepository.getUserById(userId);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
            }

            // return the user
            return res.status(StatusCodes.OK).json(user);
        } catch (error) {
            // return error
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    },

    async updateUser(req: Request, res: Response) {
        try {
            // get the user id
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            // get the changes
            const { username, avatar_url } = req.body;
            if (!username && !avatar_url) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nothing to update" });
            }

            // try to update the user
            const updatedUser = await UserRepository.updateProfile(userId, { username, avatar_url });
            return res.status(StatusCodes.OK).json(updatedUser);
        } catch (error: any) {
            // if this is uniqe name error
            if (error.code === UNIQUE_VIOLATION) {
                return res.status(StatusCodes.CONFLICT).json({ error: "Username is already taken" });
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    },

    async getLeaderboard(req: Request, res: Response) {
        try {
            // get the players and return them
            const players = await UserRepository.getLeaderboard();
            return res.status(StatusCodes.OK).json(players);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    },

    async searchUser(req: Request, res: Response) {
        try {
            // get the query
            const query = req.query.q as string;
            if (!query || query.length < 1) {
                return res.status(StatusCodes.OK).json([]);
            }

            // get the players
            const players = await UserRepository.searchUsers(query);
            return res.status(StatusCodes.OK).json(players);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    }
};

module.exports = UserController;