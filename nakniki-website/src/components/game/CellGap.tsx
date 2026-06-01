import { useState } from 'react';
import { Box } from '@radix-ui/themes';
import { Orientation } from '@nakniki/shared';
import Wall from './Wall';

interface CellGapProps {
    orientation: Orientation;
    isPlaced?: boolean;
    isValidPreview?: boolean;
    isActiveTurn?: boolean;
    onClick?: () => void;
}

export default function CellGap({ orientation, isPlaced = false, isValidPreview = false, isActiveTurn = false, onClick }: CellGapProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isHorizontal = orientation === Orientation.HORIZONTAL;

    // --- THE FIX: We always anchor Left/Top! The reversed array map handles the rest natively! ---
    const anchorCSS = isHorizontal ? { left: 0 } : { top: 0 };

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                if (isActiveTurn && !isPlaced && isValidPreview && onClick) {
                    onClick();
                    setIsHovered(false); 
                }
            }}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundColor: 'transparent',
                cursor: (isActiveTurn && !isPlaced && isValidPreview) ? 'pointer' : 'default',
            }}
        >
            {isPlaced && (
                <Box style={{ position: 'absolute', ...anchorCSS, zIndex: 15 }}>
                    <Wall orientation={orientation} isPreview={false} />
                </Box>
            )}

            {isHovered && !isPlaced && isValidPreview && isActiveTurn && (
                <Box style={{ position: 'absolute', ...anchorCSS, zIndex: 30 }}>
                    <Wall orientation={orientation} isPreview={true} />
                </Box>
            )}
        </Box>
    );
}