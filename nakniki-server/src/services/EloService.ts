import { UserRepository } from '../repositories/UserRepository';

export class EloService {

    public static calculateNewElo(playerElo: number, opponentElo: number, won: boolean): number {

        // TODO -------- AVI IMPLEMENT THIS

        return 1200;
    }

    public static async updateMatchStats(winnerId: string, loserId: string): Promise<void> {
        try {
            // get the players info
            const winner = await UserRepository.getUserById(winnerId);
            const loser = await UserRepository.getUserById(loserId);

            // calculate the new elo
            const newWinnerElo = this.calculateNewElo(winner.elo_rating, loser.elo_rating, true);
            const newLoserElo = this.calculateNewElo(loser.elo_rating, winner.elo_rating, false);

            // update the stats for the players
            await Promise.all([
                UserRepository.updateStatsAfterGame(winnerId, newWinnerElo, true),
                UserRepository.updateStatsAfterGame(loserId, newLoserElo, false)
            ]);
        } catch (error) {
            console.error("EloService Error - Failed to update user stats:", error);
        }
    }
}