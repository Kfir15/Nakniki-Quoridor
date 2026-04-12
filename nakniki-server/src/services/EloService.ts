import { UserRepository } from '../repositories/UserRepository';
import { ELO_CONSTANTS as ELO} from '../constants/elo.constants';

export class EloService {

    public static calculateNewElo(playerElo: number, opponentElo: number, win: boolean): number {

        // In case the parameters sent to the function are invalid
        if (playerElo == null || isNaN(playerElo) || opponentElo == null || isNaN(opponentElo)) {
            console.warn("EloService Warning - Missing elo rating for player or opponent. Reseting Elo to default.");
            // Changes the ELO to either be the previous one, or the default one if it was invalid
            playerElo = playerElo ?? ELO.DEFAULT_ELO;
            opponentElo = opponentElo ?? ELO.DEFAULT_ELO;
        }

        const winProbability = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / ELO.WINPROBABILITYFACTOR));
        const score = win ? 1 : 0;
        const newElo = Math.round(playerElo + ELO.ELOFACTOR * (score - winProbability));
        if (newElo < ELO.MIN_ELO) {
            return ELO.MIN_ELO;
        }
        return newElo;
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