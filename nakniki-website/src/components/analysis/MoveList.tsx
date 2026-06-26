import { Box, Text } from '@radix-ui/themes';
import { type MatchAction } from '../../constants/analysis.constants';
import { GAME_CONSTANTS as G } from '@nakniki/shared';
import { UI_CONSTANTS as C } from '../../constants/ui.constants';

export function MoveList({ actions, currentIndex, onSelect }: {
    actions: MatchAction[];
    currentIndex: number;
    onSelect: (i: number) => void;
}) {
    const fmt = (a: MatchAction) =>
        a.action_type === G.ACTION_TYPES.WALL ? `Wall ${String(a.action_data.orient).toUpperCase()} (${a.action_data.r}, ${a.action_data.c})`
      : a.action_type === G.ACTION_TYPES.MOVE ? `Move (${a.action_data.r}, ${a.action_data.c})`
      : 'Timeout';

    return (
        <Box style={{ height: '100%', overflowY: 'auto', padding: 12,
            backgroundColor: 'rgba(15,15,15,0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
            {actions.map((a, i) => {
                const step = i + 1;                       // the state AFTER move i
                const isCurrent = currentIndex === step;
                const isP1 = i % 2 === 0;                  // moves strictly alternate, P1 first
                return (
                    <Box key={a.id} onClick={() => onSelect(step)} style={{
                        padding: 8, marginBottom: 16, cursor: 'pointer', borderRadius: 8,
                        backgroundColor: isCurrent ? C.COLORS.BACKGROUND : 'transparent',
                        borderLeft: `4px solid ${isP1 ? C.COLORS.P1.SOLID : C.COLORS.P2.SOLID}`,
                    }}>
                        <Text size="2" style={{ color: 'white' }}>{i + 1}. {fmt(a)}</Text>
                    </Box>
                );
            })}
        </Box>
    );
}