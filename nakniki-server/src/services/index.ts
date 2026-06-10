import { GameManager } from '../game_model/GameManager';
import { TournamentService } from './TournamentService';
import { MultiplayerService } from './MultiplayerService';
import { AIGameService } from './AIGameService';

export const gameManager = new GameManager();
export const tournamentService = new TournamentService(gameManager);
export const multiplayerService = new MultiplayerService(gameManager, tournamentService);
export const aiService = new AIGameService(gameManager);