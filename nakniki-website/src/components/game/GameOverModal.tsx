import React from 'react';
import { Flex, Text, Box, Button } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { Trophy, Clock, Swords, Home } from 'lucide-react';
import { PlayerRole } from '@nakniki/shared';

interface GameOverModalProps {
    isOpen: boolean;
    winner: PlayerRole | null;
    myRole: PlayerRole;
    reason: 'PATH_REACHED' | 'TIMEOUT' | string; 
    eloChange: number; 
    onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
    isOpen,
    winner,
    myRole,
    reason,
    eloChange,
    onReturnHome
}) => {
    if (!isOpen) return null;

    const isWinner = winner === myRole;
    const isTimeout = reason === 'TIMEOUT';

    return (
        <Box style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 5, 5, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000, // Ensures it sits above the board and sidebars
            overflow: 'hidden'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                style={{
                    width: '420px',
                    backgroundColor: 'rgba(15, 15, 15, 0.9)',
                    border: `1px solid ${isWinner ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: isWinner 
                        ? '0 30px 70px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                        : '0 30px 70px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                    textAlign: 'center'
                }}
            >
                {/* STATUS ICON */}
                <Flex justify="center" mb="5">
                    <motion.div
                        animate={isWinner ? { rotate: [0, -10, 10, -10, 0] } : { scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: isWinner ? 3 : 2, ease: "easeInOut" }}
                    >
                        {isWinner ? (
                            <Box style={{ padding: '20px', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%' }}>
                                <Trophy size={48} color="#FBBF24" />
                            </Box>
                        ) : (
                            <Box style={{ padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
                                {isTimeout ? <Clock size={48} color="#ef4444" /> : <Swords size={48} color="#ef4444" />}
                            </Box>
                        )}
                    </motion.div>
                </Flex>

                {/* GAME OUTCOME HEADING */}
                <Text 
                    size="8" 
                    weight="bold" 
                    style={{ 
                        letterSpacing: '4px', 
                        color: isWinner ? '#FBBF24' : '#ef4444',
                        display: 'block',
                        fontFamily: 'monospace'
                    }}
                >
                    {isWinner ? 'NAKNIKI-WINNER!' : 'NAKNIKI-TERMINATED!'}
                </Text>

                {/* SUBTITLE REASON */}
                <Text size="2" color="gray" style={{ display: 'block', letterSpacing: '0.5px' }}>
                    {isTimeout 
                        ? 'Match terminated due to clock timeout execution.' 
                        : 'Opponent pawn successfully crossed the terminal boundary.'}
                </Text>

                {/* STATS BREAKDOWN CARD */}
                <Box style={{
                    margin: '32px 0',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '12px'
                }}>
                    <Flex align="center">
                        <Text size="2" color="gray">Performance Matrix</Text>
                        <Text 
                            size="4" 
                            weight="bold" 
                            style={{ 
                                color: eloChange >= 0 ? '#4ADE80' : '#ef4444',
                                fontFamily: 'monospace'
                            }}
                        >
                            {eloChange >= 0 ? `+${eloChange}` : eloChange} ELO
                        </Text>
                    </Flex>
                </Box>

                {/* NAVIGATION ACTION */}
                <Button 
                    onClick={onReturnHome}
                    size="3" 
                    variant="surface"
                    color="gray"
                    style={{ 
                        width: '100%', 
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white'
                    }}
                >
                    <Flex align="center" gap="2">
                        <Home size={16} />
                        Return to Hub
                    </Flex>
                </Button>
            </motion.div>
        </Box>
    );
};