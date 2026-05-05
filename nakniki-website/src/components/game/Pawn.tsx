import { PlayerRole } from '@nakniki/shared';
import { motion } from 'framer-motion'

interface PawnProps {
    player: PlayerRole;
    isCurrentTurn?: boolean;
    onClick?: () => void;
}

export default function Pawn({ player, isCurrentTurn, onClick }: PawnProps) {
    
    // get the pawn color base on his role (ketchup vs mustard)
    const isP1 = player === PlayerRole.P1;
    const baseColor = isP1 ? 'rgba(139,0,0,1.0)' : 'rgba(218,165,32,1.0)';
    const glowColor = isP1 ? 'rgba(230, 45, 45, 0.4)' : 'rgba(225, 213, 45, 0.4)';

    return (
        <motion.div
            layoutId={`pawn-${player}`}
            
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
                    ? `0 0 20px ${glowColor}, inset 0 -4px 8px rgba(0,0,0,0.2)` 
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
                width: '65%',
                height: '65%',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 25%, ${baseColor} 0%`,
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