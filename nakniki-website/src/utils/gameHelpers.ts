import { type GameState, Position, BoardManager, GAME_CONSTANTS as G, PlayerRole } from '@nakniki/shared';

export const hydrateGameState = (rawState: GameState): GameState => {
    return {
        ...rawState,
        player1: {
            ...rawState.player1,
            position: new Position(rawState.player1.position.r, rawState.player1.position.c)
        },
        player2: {
            ...rawState.player2,
            position: new Position(rawState.player2.position.r, rawState.player2.position.c)
        }
    };
};

export const createLocalBoardManager = (extendedBoard?: any[][]): BoardManager => {
    const localBoardManager = new BoardManager(G.BOARD_SIZE);
    if (extendedBoard) {
        localBoardManager.loadBoard(extendedBoard);
    }
    return localBoardManager;
};

// --- NEW: Frontend Move Calculator that supports Jumps & Diagonals ---
export const getValidMoves = (gameState: GameState, role: PlayerRole): Position[] => {
    const validMoves: Position[] = [];
    const player = role === PlayerRole.P1 ? gameState.player1 : gameState.player2;
    const opponent = role === PlayerRole.P1 ? gameState.player2 : gameState.player1;
    const size = gameState.size;
    const board = gameState.extendedBoard;

    if (!board) return [];

    const currentPos = player.position;
    const oppPos = opponent.position;

    // Helper: Safely checks if a wall blocks movement between two adjacent cells
    const isBlocked = (r1: number, c1: number, r2: number, c2: number) => {
        const midR = r1 + r2; 
        const midC = c1 + c2;
        const node = board[midR]?.[midC];
        if (!node) return false;
        
        const cellStr = String(node).toUpperCase();
        return cellStr !== 'EMPTY' && cellStr !== 'CELL' && cellStr !== 'INTERSECTION' && cellStr !== 'FALSE';
    };

    const inBounds = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size;

    const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ];

    for (const dir of directions) {
        const nextR = currentPos.r + dir.dr;
        const nextC = currentPos.c + dir.dc;

        if (!inBounds(nextR, nextC)) continue;
        if (isBlocked(currentPos.r, currentPos.c, nextR, nextC)) continue;

        // Special Rule: Opponent is standing on the target cell
        if (nextR === oppPos.r && nextC === oppPos.c) {
            const jumpR = nextR + dir.dr;
            const jumpC = nextC + dir.dc;

            // Is the straight jump blocked by a wall or the board edge?
            const straightJumpBlocked = !inBounds(jumpR, jumpC) || isBlocked(nextR, nextC, jumpR, jumpC);

            if (!straightJumpBlocked) {
                // Allow Straight Jump
                validMoves.push(new Position(jumpR, jumpC));
            } else {
                // Rule: If straight jump is blocked, you can jump Diagonally
                if (dir.dr !== 0) { // Moving vertically
                    if (inBounds(nextR, nextC - 1) && !isBlocked(nextR, nextC, nextR, nextC - 1)) {
                        validMoves.push(new Position(nextR, nextC - 1));
                    }
                    if (inBounds(nextR, nextC + 1) && !isBlocked(nextR, nextC, nextR, nextC + 1)) {
                        validMoves.push(new Position(nextR, nextC + 1));
                    }
                } else if (dir.dc !== 0) { // Moving horizontally
                    if (inBounds(nextR - 1, nextC) && !isBlocked(nextR, nextC, nextR - 1, nextC)) {
                        validMoves.push(new Position(nextR - 1, nextC));
                    }
                    if (inBounds(nextR + 1, nextC) && !isBlocked(nextR, nextC, nextR + 1, nextC)) {
                        validMoves.push(new Position(nextR + 1, nextC));
                    }
                }
            }
        } else {
            // Standard step
            validMoves.push(new Position(nextR, nextC));
        }
    }

    return validMoves;
};