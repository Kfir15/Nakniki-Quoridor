import { Box, Text } from "@radix-ui/themes";
import { UI_CONSTANTS as C } from "../../constants/ui.constants";

const minAdv = -5;
const maxAdv = 5

export function EvalBar({ evaluation }: { evaluation: number | null }) {
    const e = evaluation ?? 0;
    const score = Math.max(minAdv, Math.min(maxAdv, e));
    const scorePrecentage = (score + 5) * 10;
    return (
         <Box style={{ 
            width: 44, 
            height: '100%', 
            borderRadius: 10, 
            overflow: 'hidden',
            position: 'relative', 
            backgroundColor: C.COLORS.P2.SOLID }}> 
            <Box style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0,
                height: `${scorePrecentage}%`, 
                backgroundColor: C.COLORS.P1.SOLID,
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