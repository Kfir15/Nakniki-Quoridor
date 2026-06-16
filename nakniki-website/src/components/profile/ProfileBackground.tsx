import { Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';

// a single faint hotdog line-art that slowly pulses its glow, sitting behind the profile.
export default function ProfileBackground() {
    return (
        <Box style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: -1,                       // behind everything
            pointerEvents: 'none', 
            backgroundColor: '#0a0a0a',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <svg
                viewBox="0 0 260 120"
                fill="none"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                // big + slanted so it runs corner-to-corner (overflow on the Box clips the ends)
                style={{ width: '120vw', transform: 'rotate(-22deg)' }}
            >
                {/* bun — brownish glow (static glow, cheap opacity pulse) */}
                <motion.rect
                    x="12" y="34" width="236" height="54" rx="27"
                    stroke="rgba(117, 52, 3, 0.45)"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(117, 52, 3, 0.5))' }}
                    animate={{ opacity: [0.45, 0.9] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                {/* sausage — orange glow */}
                <motion.rect
                    x="34" y="46" width="192" height="30" rx="15"
                    stroke="rgba(249, 115, 22, 0.5)"
                    style={{ filter: 'drop-shadow(0 0 18px rgba(249,115,22,0.55))' }}
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                {/* mustard squiggle — red glow */}
                <motion.path
                    d="M 50 61 Q 66 47 82 61 T 114 61 T 146 61 T 178 61 T 210 61"
                    stroke="rgba(239, 68, 68, 0.6)"
                    style={{ filter: 'drop-shadow(0 0 18px rgba(239,68,68,0.6))' }}
                    animate={{ opacity: [0.55, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
            </svg>
        </Box>
    );
}
