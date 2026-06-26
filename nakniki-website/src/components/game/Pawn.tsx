import { PlayerRole } from '@nakniki/shared';
import { motion } from 'framer-motion'
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

interface PawnProps {
    player: PlayerRole;
    isCurrentTurn?: boolean;
    onClick?: () => void;
    disableLayout?: boolean;
}

export default function Pawn({ player, isCurrentTurn, onClick, disableLayout }: PawnProps) {
    
    // get the pawn theme base on his role (ketchup vs mustard)
    const theme = player === PlayerRole.P1 ? UI.COLORS.P1 : UI.COLORS.P2;

    return (
        <motion.div
            {...(disableLayout ? {} : { layoutId: `pawn-${player}` })}
            
            // trigger
            onPointerDown={(e) => {
                e.stopPropagation();
                if (isCurrentTurn && onClick) {
                    onClick();
                }
            }}
            
            // animation 
            animate={{ 
                scale: 1,
                boxShadow: isCurrentTurn 
                    ? `0 0 20px ${theme.GLOW}, inset 0 -4px 8px rgba(0,0,0,0.2)` 
                    : `0 4px 8px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.2)`
            }}
            whileHover={isCurrentTurn ? { scale: 1.05 } : {}}
            whileTap={isCurrentTurn ? { cursor: 'grabbing', scale: 0.95 } : {}}
            transition={{ 
                type: "spring", 
                stiffness: 450, 
                damping: 30,
                mass: 0.8
            }}
            
            style={{
                width: UI.DIMENSIONS.PAWN_SIZE,
                height: UI.DIMENSIONS.PAWN_SIZE,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 25%, ${theme.BASE} 0%`,
                zIndex: 10,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isCurrentTurn ? 'grab' : 'default',
                touchAction: 'none'
            }}
        >
        </motion.div>
    );
}