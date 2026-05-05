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
    // variables of the gap
    const [isHovered, setIsHovered] = useState(false);
    const isHorizontal = orientation === Orientation.HORIZONTAL;

    return (
        <Box
            // show wall preview
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
                backgroundColor: 'transparent', // STRICTLY invisible
                cursor: (isActiveTurn && !isPlaced && isValidPreview) ? 'pointer' : 'default',
            }}
        >
            {/* if wall placed, show him */}
            {isPlaced && (
                <Box style={{ position: 'absolute', [isHorizontal ? 'left' : 'top']: 0, zIndex: 15 }}>
                    <Wall orientation={orientation} isPreview={false} />
                </Box>
            )}

            {isHovered && !isPlaced && isValidPreview && isActiveTurn && (
                <Box style={{ position: 'absolute', [isHorizontal ? 'left' : 'top']: 0, zIndex: 30 }}>
                    <Wall orientation={orientation} isPreview={true} />
                </Box>
            )}
        </Box>
    );
}