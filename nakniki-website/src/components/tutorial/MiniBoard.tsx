import { PlayerRole, Orientation } from '../../constants/tutorial.constants';
import Pawn from '../game/Pawn';

// a small, static, declarative board for the tutorial.
// you describe what's on it; it draws it. no game state involved.
export interface MiniPawn { player: PlayerRole; r: number; c: number; }
export interface MiniWall { r: number; c: number; orientation: Orientation; }
export interface MiniCell { r: number; c: number; }

interface MiniBoardProps {
    size?: number;            // board is size x size (default 4)
    pawns?: MiniPawn[];
    walls?: MiniWall[];       // wall at (r,c): horizontal sits below row r; vertical sits right of col c
    highlights?: MiniCell[];  // cells to mark as "you could move here"
}

const CELL = 48;   // px
const GAP = 10;    // px between cells (where walls live)

export default function MiniBoard({ size = 4, pawns = [], walls = [], highlights = [] }: MiniBoardProps) {
    // build the grid track list: CELL, GAP, CELL, GAP, ... , CELL  (2*size - 1 tracks)
    const tracks = Array.from({ length: size * 2 - 1 }, (_, i) => (i % 2 === 0 ? `${CELL}px` : `${GAP}px`));
    const template = tracks.join(' ');

    const pawnAt = (r: number, c: number) => pawns.find(p => p.r === r && p.c === c);
    const isHighlight = (r: number, c: number) => highlights.some(h => h.r === r && h.c === c);

    // flatten the size x size grid into cell elements
    const cells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const p = pawnAt(r, c);
            cells.push(
                <div
                    key={`cell-${r}-${c}`}
                    style={{
                        gridColumn: 2 * c + 1,   // cells live on the odd tracks
                        gridRow: 2 * r + 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                    }}
                >
                    {p && <Pawn player={p.player} />}
                    {isHighlight(r, c) && (
                        <div style={{
                            width: '45%',
                            height: '45%',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.35)',
                        }} />
                    )}
                </div>
            );
        }
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: template,
            gridTemplateRows: template,
            padding: '16px',
            background: 'rgba(15, 15, 15, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            backdropFilter: 'blur(10px)',
        }}>
            {cells}

            {walls.map((w, i) => {
                const isH = w.orientation === Orientation.HORIZONTAL;
                return (
                    <div
                        key={`wall-${i}`}
                        style={{
                            // a wall spans two cells + the gap between them, sitting in the gap track
                            gridColumn: isH ? `${2 * w.c + 1} / ${2 * w.c + 4}` : `${2 * w.c + 2}`,
                            gridRow: isH ? `${2 * w.r + 2}` : `${2 * w.r + 1} / ${2 * w.r + 4}`,
                            background: 'rgba(220, 40, 40, 0.95)',
                            borderRadius: '4px',
                            boxShadow: '0 0 12px rgba(230, 45, 45, 0.7)',
                            alignSelf: 'stretch',
                            justifySelf: 'stretch',
                            zIndex: 5,
                        }}
                    />
                );
            })}
        </div>
    );
}
