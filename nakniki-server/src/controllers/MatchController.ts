import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { MatchRepository } from '../repositories/MatchRepository';

export const MatchController = {
    async getMatchHistory(req: Request, res: Response) {
        try {
            // get user id
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            // get the matches history
            const history = await MatchRepository.getUserMatchHistory(userId);
            return res.status(StatusCodes.OK).json(history);

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    }
}