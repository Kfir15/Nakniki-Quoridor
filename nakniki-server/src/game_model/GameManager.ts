import { GameModel } from './GameModel';
import { GAME_CONSTANTS as G } from '../constants/game.constants';
import { PlayerRole } from '../types/game.enums';

export interface GameSession {
    game: GameModel;
    isAI: boolean;
    isPublicLobby: boolean;
    lobbyTimeout?: NodeJS.Timeout | undefined;
    tournamentMatchId?: string | undefined
    dbMatchId?: string | undefined;
    actionHistory: any[];
    sockets: {
        [PlayerRole.P1]: string | null;
        [PlayerRole.P2]: string | null;
    };
    userIds: {
        [PlayerRole.P1]: string | null;
        [PlayerRole.P2]: string | null;
    };
}

export class GameManager {
    private games: Map<string, GameSession>;

    constructor() {
        this.games = new Map<string, GameSession>();
    }

    // generate random 6 digits game id
    private generateSessionId(): string {
        const characters = G.SESSION_ID_CHARACTERS;
        const MAX_ATTEMPTS = G.MAX_SESSION_GENERATION_ATTEMPTS;

        // generate unique game id
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            let result = '';
            for (let i = 0; i < G.SESSION_ID_LENGTH; i++) {
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
    public createSession(isAI: boolean = false, isPublicLobby: boolean = false, tournamentMatchId?: string): { gameId: string, session: GameSession } {
        // get the game id
        const gameId = this.generateSessionId();

        // create the new game
        const newGame = new GameModel(gameId);

        const newSession: GameSession = {
            game: newGame,
            isAI: isAI,
            isPublicLobby: isPublicLobby,
            lobbyTimeout: undefined,
            tournamentMatchId: tournamentMatchId,
            dbMatchId: undefined,
            actionHistory: [],
            sockets: {
                [PlayerRole.P1]: null,
                [PlayerRole.P2]: null
            },
            userIds: {
                [PlayerRole.P1]: null,
                [PlayerRole.P2]: null
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
            // if this is multiplayer public empty lobby
            if (!session.isAI
                && session.isPublicLobby
                && !session.tournamentMatchId
                && session.sockets[PlayerRole.P1] !== null
                && session.sockets[PlayerRole.P2] === null) {
                AvailableLobbies.push({
                    gameId: gameId,
                    hostId: session.userIds[PlayerRole.P1]!
                })
            }
        }

        return AvailableLobbies;
    }
}