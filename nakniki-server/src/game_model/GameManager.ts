import { GameModel } from './GameModel';

export class GameManager {
    private games: Map<string, GameModel>;

    constructor() {
        this.games = new Map<string, GameModel>();
    }

    // generate random 6 digits game id
    private generateGameId(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const MAX_ATTEMPTS = 1000;

        // generate unique game id
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // if the game id is unique
            if (!this.games.has(result)) {
                return result;
            }
        }

        // if couldnt find a unique game id
        throw new Error("Server is too busy to generate a unique lobby code right now.");
    }


    // create new game
    public createGame(): GameModel {
        // get the game id
        const gameId = this.generateGameId();

        // create the new game
        const newGame = new GameModel(gameId);
        this.games.set(gameId, newGame);

        return newGame;
    }

    // get game by id
    public getGame(gameId: string): GameModel | undefined {
        return this.games.get(gameId);
    }

    // check if game exists
    public hasGame(gameId: string): boolean {
        return this.games.has(gameId);
    }

    // delete game
    public deleteGame(gameId: string): boolean {
        return this.games.delete(gameId);
    }
}