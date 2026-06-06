import { Flex, Box } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerRole } from '@nakniki/shared';

interface WallCounterProps {
    count: number;
    role: PlayerRole;
}

export default function WallCounter({ count, role }: WallCounterProps) {
    // shows the walls left for this player
    const walls = Array.from({ length: count }, (_, i) => i);
    const isP1 = role === PlayerRole.P1;
    const glowColor = isP1 ? 'rgba(230, 45, 45, 0.2)' : 'rgba(225, 213, 45, 0.2)';

    return (
        <Flex gap="6" align="center" justify="center" style={{ height: '40px' }}>
            <AnimatePresence>
                {walls.map((id) => (
                    <motion.div
                        key={`${role}-wall-${id}`}
                        layout
                        initial={{ opacity: 0, scale: 0.5, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0, y: 20, transition: { duration: 0.3 } }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                            width: '10px',
                            height: '50px',
                            background: 'rgba(128,0,0,1.0)',
                            borderRadius: '3px',
                            boxShadow: `0 4px 8px rgba(0,0,0,0.6), 0 0 10px ${glowColor}, inset 0 2px 4px rgba(255,255,255,0.25)`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Box style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, 
                            height: '2px',
                            backgroundColor: 'rgba(255,255,255,0.3)',
                        }} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </Flex>
    );
}