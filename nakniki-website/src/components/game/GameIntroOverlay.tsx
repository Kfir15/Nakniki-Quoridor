import { Box, Text } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

interface GameIntroOverlayProps {
    onComplete?: () => void;
}

export default function GameIntroOverlay({ onComplete }: GameIntroOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [phase, setPhase] = useState(1);

    useEffect(() => {
        // phase 1 - show "NAKNIKI QUORIDOR"
        const t1 = setTimeout(() => setPhase(2), UI.TIMINGS.INTRO_PHASE_1);
        
        // phase 2 - BEGIN text
        const t2 = setTimeout(() => setIsVisible(false), UI.TIMINGS.INTRO_PHASE_2);

        // phase 3 - doors
        const t3 = setTimeout(() => {
            if (onComplete) onComplete();
        }, UI.TIMINGS.INTRO_PHASE_3);
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <Box
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none' 
                    }}
                >
                    <motion.div
                        initial={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, height: '50vh',
                            backgroundColor: '#050505',
                            borderBottom: '2px solid rgba(239, 68, 68, 0.4)',
                            boxShadow: '0 10px 50px rgba(239,68,68,0.2)'
                        }}
                    />
                    
                    {/* doors */}
                    <motion.div
                        initial={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                        style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0, height: '50vh',
                            backgroundColor: '#050505',
                            borderTop: '2px solid rgba(239, 68, 68, 0.4)',
                            boxShadow: '0 -10px 50px rgba(239,68,68,0.2)'
                        }}
                    />

                    {/* show text by the phase */}
                    <motion.div 
                        style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}
                        exit={{ opacity: 0, scale: 1.4, filter: 'blur(15px)' }} 
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                    >
                        <AnimatePresence mode="wait">
                            {phase === 1 && (
                                <motion.div
                                    key="phase1"
                                    initial={{ scale: 0.85, opacity: 0, letterSpacing: '0px' }}
                                    animate={{ scale: 1, opacity: 1, letterSpacing: '12px' }}
                                    exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                >
                                    <Text weight="bold" style={{
                                        color: '#ffffff',
                                        textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 50px rgba(239, 68, 68, 0.5)',
                                        fontSize: '3.5rem',
                                        fontFamily: 'monospace',
                                        textTransform: 'uppercase'
                                    }}>
                                        NAKNIKI QUORIDOR
                                    </Text>
                                </motion.div>
                            )}
                            {phase === 2 && (
                                <motion.div
                                    key="phase2"
                                    initial={{ scale: 2, opacity: 0, filter: 'blur(20px)' }}
                                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <Text weight="bold" style={{
                                        color: '#4ade80',
                                        letterSpacing: '25px',
                                        textShadow: '0 0 30px rgba(74, 222, 128, 0.8), 0 0 60px rgba(74, 222, 128, 0.4)',
                                        fontSize: '6rem',
                                        fontFamily: 'monospace',
                                        textTransform: 'uppercase'
                                    }}>
                                        BEGIN
                                    </Text>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </Box>
            )}
        </AnimatePresence>
    );
}