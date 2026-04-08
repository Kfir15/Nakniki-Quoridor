import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { UserRepository } from '../repositories/UserRepository';
import { uploadAvatarToSupabase, deleteOldAvatar } from '../utils/storageHelper';
import { DB_CONSTANTS as DB } from '../constants/db.constants';
import { MatchRepository } from '../repositories/MatchRepository';

export const UserController = {
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
            let { username } = req.body;
            let avatar_url = req.body.avatar_url;

            // if new avatar uploaded
            if (req.file) {
                // get the current url and upload the new avatar
                const currentUser = await UserRepository.getUserById(userId);
                avatar_url = await uploadAvatarToSupabase(req.file);

                // delete the old avatar from storage
                if (currentUser && currentUser.avatar_url) {
                    await deleteOldAvatar(currentUser.avatar_url);
                }
            }

            if (!username && !avatar_url) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nothing to update" });
            }

            // try to update the user
            const updatedUser = await UserRepository.updateProfile(userId, { username, avatar_url });
            return res.status(StatusCodes.OK).json(updatedUser);
        } catch (error: any) {
            // if this is uniqe name error
            if (error.code === DB.ERROR_CODES.UNIQUE_VIOLATION) {
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
    },

    async searchUserH2H(req: Request, res: Response) {
        try {
            // get the users id's
            const userId = req.user?.id;
            const opponentId = req.params.id as string;
            if (!userId || !opponentId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "IDs required" });
            }

            // get the stats
            const stats = await MatchRepository.getH2HStats(userId, opponentId);
            return res.status(StatusCodes.OK).json(stats);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    }
};