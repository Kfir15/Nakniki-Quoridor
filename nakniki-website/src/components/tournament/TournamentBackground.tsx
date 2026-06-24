import { Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const TROPHIES = [
    { top: '15%', left: '8%',  size: 42, dur: 15, delay: 0   },
    { top: '62%', left: '18%', size: 28, dur: 19, delay: 2   },
    { top: '28%', left: '82%', size: 54, dur: 16, delay: 1   },
    { top: '72%', left: '72%', size: 36, dur: 21, delay: 3   },
    { top: '86%', left: '48%', size: 44, dur: 23, delay: 1.5 },
    { top: '24%', left: '56%', size: 64, dur: 14, delay: 0.5 },
    { top: '65%', left: '38%', size: 30, dur: 20, delay: 2.5 },
    { top: '50%', left: '92%', size: 46, dur: 18, delay: 1   },
    { top: '22%', left: '24%', size: 40, dur: 18, delay: 0   },
    { top: '76%', left: '6%', size: 52, dur: 18, delay: 1   },
];

export function TournamentBackground() {
    return (
        <Box style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            { /* grid */ }
            <Box style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                backgroundSize: '44px 44px'
            }} />
            {/* drifting trophies */}
            {TROPHIES.map((t, i) => (
                <motion.div key={i}
                    animate={{ z: [0, 12, 0], y: [0, -36, 0], rotate: [-24, 24, -24], opacity: [0.16, 0.40, 0.16] }}
                    transition={{ duration: t.dur, delay: t.delay, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: t.top, left: t.left }}>
                    <Trophy size={t.size} color="brown" />
                </motion.div>
            ))}
        </Box>
    );
}