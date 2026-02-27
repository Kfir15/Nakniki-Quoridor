import { GameModel } from './GameModel';

export interface GameSession {
    game: GameModel;
    isAI: boolean;
}

export class GameManager {
    private games: Map<string, GameSession>;

    constructor() {
        this.games = new Map<string, GameSession>();
    }

    // generate random 6 digits game id
    private generateSessionId(): string {
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

    // create new Session
    public createSession(isAI: boolean = false): { gameId: string, session: GameSession } {
        // get the game id
        const gameId = this.generateSessionId();

        // create the new game
        const newGame = new GameModel(gameId);
        const newSession: GameSession = {
            game: newGame,
            isAI: isAI
        };

        // store the session in the map
        this.games.set(gameId, newSession);

        // return both the ID and the session
        return { gameId, session: newSession };
    }

    // get Session by id
    public getSession(gameId: string): GameSession | undefined {
        return this.games.get(gameId);
    }

    // check if Session exists
    public hasSession(gameId: string): boolean {
        return this.games.has(gameId);
    }

    // delete Session
    public deleteSession(gameId: string): boolean {
        return this.games.delete(gameId);
    }
}