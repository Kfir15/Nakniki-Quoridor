import { Box, Text } from "@radix-ui/themes";
import { UI_CONSTANTS as C } from "../../constants/ui.constants";

const minAdv = -5;
const maxAdv = 5

export function EvalBar({ evaluation, flipped = false }: { evaluation: number | null; flipped?: boolean }) {
    const raw = evaluation ?? 0;
    const e = flipped ? -raw : raw;                                    // value from the viewer's perspective
    const score = Math.max(minAdv, Math.min(maxAdv, e));
    const scorePrecentage = (score + 5) * 10;                          // viewer's advantage fills from the bottom
    const fillColor = flipped ? C.COLORS.P2.SOLID : C.COLORS.P1.SOLID; // viewer's colour (bottom)
    const bgColor   = flipped ? C.COLORS.P1.SOLID : C.COLORS.P2.SOLID; // opponent's colour (top)
    return (
         <Box style={{
            width: 44,
            height: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: bgColor }}>
            <Box style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${scorePrecentage}%`,
                backgroundColor: fillColor,
                transition: 'height 0.3s ease' }} />
            <Text 
            size="1" weight="bold" style={{ 
                position: 'absolute', 
                bottom: 6, 
                left: 0, 
                right: 0,
                textAlign: 'center', color: 'white' }}
                >
                {e > 0 ? '+' : ''}{e.toFixed(1)}</Text>
        </Box>
    );
}