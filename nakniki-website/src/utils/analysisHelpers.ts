import { BoardManager, Position, PlayerRole, GameStatus, type GameState, GAME_CONSTANTS as G } from "@nakniki/shared";
import { type MatchAction, type MoveAnalysis, Accuracy } from "../constants/analysis.constants";
import { Orientation } from "@nakniki/shared";

export function buildStates(actions: MatchAction[]) {
    const manager = new BoardManager(G.BOARD_SIZE);
    const p1 = { id: PlayerRole.P1, position: new Position(G.BOARD_SIZE - 1, G.MIDDLE_COL_OF_BOARD), wallsLeft: G.INITIAL_WALLS, targetRow: 0 };
    const p2 = { id: PlayerRole.P2, position: new Position(0, G.MIDDLE_COL_OF_BOARD), wallsLeft: G.INITIAL_WALLS, targetRow: G.BOARD_SIZE - 1 };
    
    let turn = PlayerRole.P1;
    let turnCount = 0;

    // A function to create game states
    const createState = (): GameState => ({
    id: '',
    size: G.BOARD_SIZE,
    player1: { ...p1, position: new Position(p1.position.r, p1.position.c)},
    player2: { ...p2, position: new Position(p2.position.r, p2.position.c)},
    turn: turn,
    status: GameStatus.IN_PROGRESS,
    winner: null,
    turnCount: turnCount,
    extendedBoard: manager.getBoard().map(row => [...row]),
    });

    // creating the array state and shoving in the initial state
    const states: GameState[] = [createState()];

    for (const action of actions) {
        let playingPlayer = p2;
        if (turn === PlayerRole.P1) playingPlayer = p1;

        // In case player moves, we update their position
        if (action.action_type === G.ACTION_TYPES.MOVE) {
             playingPlayer.position = new Position(action.action_data.r, action.action_data.c);
        }
        // In case player used wall, we reduce a wall from their bank, and place it on the board
        else if (action.action_type === G.ACTION_TYPES.WALL) {
            manager.placeWall(new Position(action.action_data.r, action.action_data.c), action.action_data.orient);
            playingPlayer.wallsLeft -= 1;
        }
        // If a player skipped, no action is needed
        // We update the turns and the turn count
        if (turn === PlayerRole.P1) turn = PlayerRole.P2;
        else turn = PlayerRole.P1;
        turnCount += 1;
        states.push(createState());
    }

    return states;
}

export const formatAction = (ba: any[]) => {
    if (!ba) return '';
    const [type, , pos, orient] = ba;                 // [type, player, [r,c], orient (may be null)]
    return type === G.ACTION_TYPES.WALL
        ? `Wall ${String(orient).toUpperCase()} (${pos[0]}, ${pos[1]})`
        : `Move (${pos[0]}, ${pos[1]})`;
};

export type Hint =
  | { kind: 'move'; mover: PlayerRole; from: { r: number; c: number }; to: { r: number; c: number } }
  | { kind: 'wall'; r: number; c: number; orient: Orientation };

export function buildBestMove(
  analysis: MoveAnalysis | null | undefined,
  prevState: GameState | undefined,
  currentIndex: number,
): 
Hint | null {
    if (!analysis || !prevState || currentIndex === 0) return null;
    if (analysis.accuracy === Accuracy.BEST) return null;          // nothing to show if the best move was player
    const ba = analysis.best_action;
    if (!ba) return null;

    if (ba[0] === 'wall') {
        const [r, c] = ba[2];
        return { kind: 'wall', r, c, orient: ba[3] as Orientation };
    }
    const moverIsP1 = (currentIndex - 1) % 2 === 0;
    const from = (moverIsP1 ? prevState.player1 : prevState.player2).position;
    const [r, c] = ba[2];
    return { kind: 'move', mover: moverIsP1 ? PlayerRole.P1 : PlayerRole.P2, from: { r: from.r, c: from.c }, to: { r, c } };
}