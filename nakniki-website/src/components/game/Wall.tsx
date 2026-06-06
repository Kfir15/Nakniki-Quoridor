import { motion } from 'framer-motion';
import { Orientation } from '@nakniki/shared';
import { Box } from '@radix-ui/themes';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

interface WallProps {
    orientation: Orientation;
    isPreview?: boolean;
}

export default function Wall({ orientation, isPreview = false }: WallProps) {
    const isHorizontal = orientation === Orientation.HORIZONTAL;

    const width = isHorizontal ? UI.DIMENSIONS.WALL_LENGTH : UI.DIMENSIONS.GAP_SIZE;
    const height = isHorizontal ? UI.DIMENSIONS.GAP_SIZE : UI.DIMENSIONS.WALL_LENGTH;

    return (
        <motion.div
            // Drop wall animation
            initial={isPreview ? { opacity: 0 } : { opacity: 0, y: -20 }}
            animate={{ opacity: isPreview ? 0.7 : 1, y: 0 }}
            transition={{ 
                type: 'spring', 
                stiffness: isPreview ? 300 : 600,
                damping: isPreview ? 30 : 25,
                mass: 0.8
            }}
            // The visuals of the wall itself
            style={{
                width,
                height,
                background: 'rgba(128,0,0,1.0)', 
                borderRadius: '0px',
                // A different, transparent color for preview mode of the wall
                boxShadow: isPreview 
                    ? '0 0 15px rgba(239, 68, 68, 0.3)' 
                    : '0 8px 12px -2px rgba(0,0,0,0.7)',
                
                position: 'relative',
                // To make it stand out compared to the rest of the board
                zIndex: 20,
                pointerEvents: 'none'
            }}
        >
            {/* Adding a highlight to the wall */}
            <Box style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: isHorizontal ? '100%' : '2px',
                height: isHorizontal ? '2px' : '100%',
                backgroundColor: 'rgba(255,255,255,0.2)',
            }} />
        </motion.div>
    );
}