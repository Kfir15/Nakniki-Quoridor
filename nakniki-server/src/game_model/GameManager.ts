import { GameModel } from './GameModel';

export interface GameSession {
    game: GameModel;
    isAI: boolean;
    leagueMatchId?: string | undefined; // optional field
    sockets: {
        p1: string | null;
        p2: string | null;
    };
    userIds: {
        p1: string | null;
        p2: string | null;
    };
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
    public createSession(isAI: boolean = false, leagueMatchId?: string): { gameId: string, session: GameSession } {
        // get the game id
        const gameId = this.generateSessionId();

        // create the new game
        const newGame = new GameModel(gameId);

        const newSession: GameSession = {
            game: newGame,
            isAI: isAI,
            leagueMatchId: leagueMatchId,
            sockets: {
                p1: null,
                p2: null
            },
            userIds: {
                p1: null,
                p2: null
            }
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

    // get waiting lobbbies
    public getAvailableLobbies(): { gameId: string, hostId: string }[] {
        const AvailableLobbies: { gameId: string, hostId: string }[] = [];

        // iterate over all the games
        for (const [gameId, session] of this.games.entries()) {
            // if this is empty lobby
            if (!session.isAI
                && !session.leagueMatchId
                && session.sockets.p1 !== null
                && session.sockets.p2 === null) {
                AvailableLobbies.push({
                    gameId: gameId,
                    hostId: session.userIds.p1!
                })
            }
        }

        return AvailableLobbies;
    }
}