import {
    GameState,
    Player,
    Position,
    BoardManager,
    GAME_CONSTANTS as G,
    PlayerRole,
    GameStatus,
    Orientation,
    ActionsValidator
} from "@nakniki/shared";

export class GameModel {
    private gameId: string;
    private size: number;
    private players: Record<PlayerRole, Player>;
    private currentTurn: PlayerRole;
    private boardManager: BoardManager;
    private turnCount: number;
    public status: GameStatus;
    public winner: PlayerRole | null;

    constructor(gameId: string) {
        this.gameId = gameId;
        this.size = G.BOARD_SIZE;
        this.boardManager = new BoardManager(this.size);
        this.players = {
            [PlayerRole.P1]: {
                id: PlayerRole.P1,
                position: new Position(G.BOARD_SIZE - 1, G.MIDDLE_COL_OF_BOARD),
                wallsLeft: G.INITIAL_WALLS,
                targetRow: 0,
            },
            [PlayerRole.P2]: {
                id: PlayerRole.P2,
                position: new Position(0, G.MIDDLE_COL_OF_BOARD),
                wallsLeft: G.INITIAL_WALLS,
                targetRow: G.BOARD_SIZE - 1,
            }
        };
        this.currentTurn = PlayerRole.P1;
        this.status = GameStatus.WAITING;
        this.turnCount = 0;
        this.winner = null;
    }

    // start the game
    public startGame(): void {
        if (this.status === GameStatus.WAITING) {
            this.status = GameStatus.IN_PROGRESS;
        }
    }

    public skipTurn(): [boolean, GameState] {
        // check if this is actually the player turn
        if (this.status !== GameStatus.IN_PROGRESS) {
            return [false, this.getState()];
        }

        // change the trun
        this.changeTurn(this.currentTurn);
        this.turnCount++;

        return [true, this.getState()];
    }

    public tryPlaceWall(playerId: PlayerRole, wallPosition: Position, orientation: Orientation): [boolean, GameState] {
        // check if the wall is valid
        const currentState = this.getState();
        const isValid = ActionsValidator.isValidWallPlacement(currentState, playerId, wallPosition, orientation, this.boardManager);
        if (!isValid) return [false, currentState];

        // if valid, apply the action
        this.boardManager.placeWall(wallPosition, orientation);
        this.players[playerId].wallsLeft--;
        this.turnCount++;
        this.changeTurn(playerId);

        return [true, this.getState()];
    }

    public tryMovePawn(playerId: PlayerRole, target: Position): [boolean, GameState] {
        // check if the move is valid
        const currentState = this.getState();
        const isValid = ActionsValidator.isValidPawnMove(currentState, playerId, target, this.boardManager);
        if (!isValid) return [false, currentState];

        // if valid, apply the action
        this.players[playerId].position = target;
        this.turnCount++;
        this.checkWin();

        // check if game over
        if (this.status !== GameStatus.FINISHED) {
            this.changeTurn(playerId);
        }

        return [true, this.getState()];
    }

    // Moves the pawn (assuming the move is valid)
    private movePawn(playerId: PlayerRole, target: Position): void {
        // Move the pawn
        this.players[playerId].position = target;

        this.turnCount++;

        // Check if the player won
        this.checkWin();

        // Switch the turn
        if (this.status !== GameStatus.FINISHED) {
            this.changeTurn(playerId);
        }
    }

    private checkWin(): void {
        if (this.players[PlayerRole.P1].position.r === this.players[PlayerRole.P1].targetRow) {
            this.status = GameStatus.FINISHED;
            this.winner = PlayerRole.P1;
        }
        if (this.players[PlayerRole.P2].position.r === this.players[PlayerRole.P2].targetRow) {
            this.status = GameStatus.FINISHED;
            this.winner = PlayerRole.P2;
        }
    }

    private changeTurn(playerId: PlayerRole): void {
        this.currentTurn = playerId === PlayerRole.P1 ? PlayerRole.P2 : PlayerRole.P1;
    }

    public getState(): GameState {
        return {
            id: this.gameId,
            size: this.size,
            player1: this.players[PlayerRole.P1],
            player2: this.players[PlayerRole.P2],
            turn: this.currentTurn,
            status: this.status,
            winner: this.winner,
            turnCount: this.turnCount,
            extendedBoard: this.boardManager.getBoard()
        };
    }
}
