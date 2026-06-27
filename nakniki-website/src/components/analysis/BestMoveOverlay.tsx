import { Box } from '@radix-ui/themes';
import { PlayerRole, Orientation } from '@nakniki/shared';
import Pawn from '../game/Pawn';
import Wall from '../game/Wall';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

const PAD = 36, CELL = 60, GAP = 10, PITCH = CELL + GAP;


export type Hint =
  | { kind: 'move'; mover: PlayerRole; from: { r: number; c: number }; to: { r: number; c: number } }
  | { kind: 'wall'; r: number; c: number; orient: Orientation };

export default function BestMoveOverlay({ hint, boardSize }: { hint: Hint; boardSize: number }) {
  const total = PAD * 2 + boardSize * CELL + (boardSize - 1) * GAP;
  const ctr = (r: number, c: number) => ({ x: PAD + c * PITCH + CELL / 2, y: PAD + r * PITCH + CELL / 2 });

  return (
    <Box style={{ position: 'absolute', top: 0, left: 0, width: total, height: total, pointerEvents: 'none', zIndex: 25 }}>
      {hint.kind === 'move' ? (
        <>
          {(() => { const a = ctr(hint.from.r, hint.from.c), b = ctr(hint.to.r, hint.to.c); return (
            <svg width={total} height={total} style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <marker id="bm-arrow" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto">
                  <path d="M0,0 L14,7 L0,14 Z" fill={UI.COLORS.ARROW} />
                </marker>
              </defs>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={UI.COLORS.ARROW} strokeWidth="4" strokeDasharray="7 5" markerEnd="url(#bm-arrow)" />
            </svg>
          ); })()}

          <Box style={{ position: 'absolute', left: PAD + hint.to.c * PITCH, top: PAD + hint.to.r * PITCH,
                        width: CELL, height: CELL, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0.45, filter: 'grayscale(0.85)' }}>
            <Pawn player={hint.mover} disableLayout />
          </Box>
        </>
      ) : (() => {
        const h = hint.orient === Orientation.HORIZONTAL;
        return (
          <Box style={{ position: 'absolute',
                        left: PAD + hint.c * PITCH + (h ? 0 : CELL),
                        top:  PAD + hint.r * PITCH + (h ? CELL : 0),
                        filter: 'grayscale(0.3) brightness(0.7)' }}>
            <Wall orientation={hint.orient} isPreview />
          </Box>
        );
      })()}
    </Box>
  );
}