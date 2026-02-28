import * as readline from 'readline';
import { GameManager } from './GameManager';
import { Position } from './Position';
import { Orientation } from './types';

// Initialize the Readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Initialize the game session
const manager = new GameManager();
const { session } = manager.createSession(false);
const game = session.game;

// Helper function to draw the board in the terminal
function printBoard() {
    const state = game.getState();
    const board = state.extendedBoard!;
    const p1Pos = state.player1.position;
    const p2Pos = state.player2.position;

    console.log("\n      0   1   2   3   4   5   6   7   8  (Cols)");
    console.log("    -------------------------------------");

    for (let r = 0; r < board.length; r++) {
        let rowStr = "";
        
        // Print Row index for playable rows
        if (r % 2 === 0) {
            rowStr += ` ${r / 2} | `;
        } else {
            rowStr += "   | ";
        }

        // FIX: Added '!' to board[r] to tell TS it's definitely not undefined
        for (let c = 0; c < board[r]!.length; c++) {
            const cell = board[r]![c];
            
            if (r % 2 === 0 && c % 2 === 0) {
                // Game Cell
                const gameR = r / 2;
                const gameC = c / 2;
                if (p1Pos.r === gameR && p1Pos.c === gameC) rowStr += " 1 ";
                else if (p2Pos.r === gameR && p2Pos.c === gameC) rowStr += " 2 ";
                else rowStr += " . ";
            } else if (r % 2 === 0 && c % 2 === 1) {
                // Vertical gap between cells
                rowStr += cell === "wall" ? "█" : " ";
            } else if (r % 2 === 1 && c % 2 === 0) {
                // Horizontal gap between cells
                rowStr += cell === "wall" ? "███" : "   ";
            } else {
                // Intersection (corners of cells)
                rowStr += cell === "wall" ? "█" : " ";
            }
        }
        console.log(rowStr);
    }
    console.log(" (Rows)\n");
    
    console.log(`🎮 TURN: ${state.turn === 'p1' ? 'Player 1 (Starts bottom, moves UP)' : 'Player 2 (Starts top, moves DOWN)'}`);
    console.log(`🧱 WALLS -> P1: ${state.player1.wallsLeft} | P2: ${state.player2.wallsLeft}`);
}

// Main game loop
function promptMove() {
    if (game.status === 'FINISHED') {
        console.log(`\n🎉 GAME OVER! ${game.winner === 'p1' ? 'Player 1' : 'Player 2'} wins! 🎉`);
        rl.close();
        return;
    }

    printBoard();

    console.log("\nCommands:");
    console.log("  Move Pawn: m <row> <col>    (e.g., 'm 7 4')");
    console.log("  Place Wall: w <row> <col> <h/v> (e.g., 'w 4 4 h' or 'w 2 3 v')");
    
    // FIX: Explicitly typed 'input' as a string
    rl.question(`\nEnter command: `, (input: string) => {
        const parts = input.trim().toLowerCase().split(' ');
        const action = parts[0];

        // Ensure we have enough arguments
        if (parts.length < 3) {
            console.log("\n❌ Invalid format. Please provide coordinates.");
            promptMove();
            return;
        }

        const r = parseInt(parts[1]!);
        const c = parseInt(parts[2]!);

        if (isNaN(r) || isNaN(c)) {
            console.log("\n❌ Invalid coordinates. Please enter numbers.");
            promptMove();
            return;
        }

        const state = game.getState();
        const currentPlayer = state.turn;

        if (action === 'm') {
            const [success] = game.tryMovePawn(currentPlayer, new Position(r, c));
            if (!success) console.log("\n❌ Invalid move! Try again.");
        } else if (action === 'w') {
            const orientation = parts[3] as Orientation;
            if (orientation !== 'h' && orientation !== 'v') {
                console.log("\n❌ Invalid orientation. Use 'h' or 'v'.");
                promptMove();
                return;
            }
            const [success] = game.tryPlaceWall(currentPlayer, new Position(r, c), orientation);
            if (!success) console.log("\n❌ Invalid wall placement! (Overlaps, out of bounds, or blocks path)");
        } else {
            console.log("\n❌ Unknown command. Use 'm' for move or 'w' for wall.");
        }

        promptMove();
    });
}

console.log("===============================");
console.log("   QUORIDOR ENGINE TESTER   ");
console.log("===============================");
promptMove();