import { Box } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardCellProps {
    isPossibleMove?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
}

export default function BoardCell({ isPossibleMove, onClick, children }: BoardCellProps) {
    return (
        <Box
            // If this is possible move, mark the cell
            onClick={isPossibleMove ? onClick : undefined}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(25, 25, 25, 0.8)', 
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.02), inset 0 -4px 8px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPossibleMove ? 'pointer' : 'default',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}

            // Activate the color highlight
            onMouseEnter={(e) => {
                if (isPossibleMove) {
                    e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 130, 0.4)';
                }
            }}
            
            // Deactivate the color highlight back to normal 
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(25, 25, 25, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            }} 
        >
            {/* The animation of the color highlight*/}
            <AnimatePresence>
                {isPossibleMove && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 130, 0.8)',
                            boxShadow: '0 0 15px rgba(16, 185, 130, 0.6)',
                            zIndex: 5,
                        }}
                    />
                )}
            </AnimatePresence>

            {children}
        </Box>
    );
}