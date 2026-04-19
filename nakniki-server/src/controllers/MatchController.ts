import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { MatchRepository } from '../repositories/MatchRepository';
import { MatchActionRepository } from '../repositories/MatchActionRepository';
import { AnalysisQueueRepository } from '../repositories/AnalysisQueueRepository';
import { QueuePriority } from '../types/analysis.enums';

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
    },

    async getMatchDetails(req: Request, res: Response) {
        try {
            // get the match and user IDs
            const matchId = req.params.id as string;
            const userId = req.user?.id;
            if (!matchId || !userId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "Match ID required" });
            }

            // if the match has pending actions
            if (await AnalysisQueueRepository.hasPendingJobs(matchId)) {
                // change the priority in the queue for this game
                await AnalysisQueueRepository.changePriority(matchId, QueuePriority.URGENT);
            }

            // fetch the match info and his actions
            const [match, actions] = await Promise.all([
                MatchRepository.getMatchById(matchId),
                MatchActionRepository.getMatchActions(matchId)
            ]);

            if (!match) {
                return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
            }

            // if the user id is not one of the players he is forbidden
            if (match.player_1_id !== userId && match.player_2_id !== userId) {
                return res.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN);
            }

            // return the match and his actions
            return res.status(StatusCodes.OK).json({
                match,
                actions
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        }
    }
}