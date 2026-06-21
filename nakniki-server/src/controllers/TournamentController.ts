import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { tournamentService } from '../services'
import { TournamentRepository } from '../repositories/TournamentRepository';

export const TournamentController = {
    async createTournament(req: Request, res: Response) {
        // Creates the tournament, using the function from service
        try {
            // user must be logged in
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            // validate input
            const { size, name } = req.body;
            if (![4, 8, 16].includes(size) || !name?.trim()) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "size must be 4/8/16 and name is required" });
            }

            const tournamentId = await tournamentService.createTournament(size, name.trim(), userId);
            return res.status(StatusCodes.CREATED).json({ id: tournamentId });

        } catch (error: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    },

    async joinTournament(req: Request, res: Response) {
        // Adds a player to the tournament, using the function from service
        try {
            // user must be logged in
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            const tournamentId = req.params.id as string;
            if (!tournamentId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "Tournament ID required" });
            }

            await tournamentService.joinTournament(tournamentId, userId);
            return res.status(StatusCodes.OK).json({ joined: true });

        } catch (error: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message});
        }
    },

    async listOpenTournaments(req: Request, res: Response) {
        // uses the function from service
        try {
            // user must be logged in
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            const tournaments = await tournamentService.getAllOpenTournaments();
            return res.status(StatusCodes.OK).json( tournaments );

        } catch (error: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message});
        }
    },

    async getTournamentDetails(req: Request, res: Response) {
        // Gives every single detail about a tournament, including matches and participants
         try {
            // user must be logged in
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            const tournamentId = req.params.id as string;
            if (!tournamentId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: "Tournament ID required" });
            }
            const details = await tournamentService.getTournamentDetails(tournamentId);
            return res.status(StatusCodes.OK).json( details );

        } catch (error: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message});
        }
    },

    async getMyTournaments(req: Request, res: Response) {
        // the tournaments the logged-in user has participated in
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            }

            const tournaments = await TournamentRepository.getUserTournaments(userId);
            return res.status(StatusCodes.OK).json(tournaments);

        } catch (error: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    },
}