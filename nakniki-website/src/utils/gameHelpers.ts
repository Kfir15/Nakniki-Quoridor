import { type GameState, Position, BoardManager, GAME_CONSTANTS as G } from '@nakniki/shared';

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