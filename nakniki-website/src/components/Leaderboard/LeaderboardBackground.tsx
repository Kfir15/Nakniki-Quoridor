import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

// define the trophies
const trophies = [
    { id: 1, left: '2%', size: 30, duration: 25, delay: 0 },
    { id: 2, left: '7%', size: 50, duration: 35, delay: 5 },
    { id: 3, left: '12%', size: 25, duration: 22, delay: 10 },
    { id: 4, left: '18%', size: 40, duration: 28, delay: 7 },
    { id: 5, right: '3%', size: 45, duration: 30, delay: 2 },
    { id: 6, right: '8%', size: 32, duration: 24, delay: 8 },
    { id: 7, right: '13%', size: 38, duration: 40, delay: 4 },
    { id: 8, right: '19%', size: 28, duration: 32, delay: 6 },
    { id: 9, left: '5%', size: 22, duration: 18, delay: 12 },
    { id: 10, right: '6%', size: 42, duration: 27, delay: 15 },
    { id: 11, left: '10%', size: 35, duration: 33, delay: 3 },
    { id: 12, right: '15%', size: 26, duration: 21, delay: 11 },
];

// define the lights
const backgroundLights = [
    { id: 'l1', style: { left: '-10%', top: '-5%' }, size: '600px', duration: 15, delay: 0, color: '225, 51, 51' },
    { id: 'l2', style: { right: '-10%', bottom: '30%' }, size: '650px', duration: 20, delay: 5, color: '51, 51, 255' },
    { id: 'l3', style: { left: '0%', bottom: '-5%' }, size: '650px', duration: 18, delay: 2, color: '153, 51, 255' },
    { id: 'l4', style: { left: '65%', top: '40%' }, size: '650px', duration: 25, delay: 0, color: '225, 51, 51' },
    { id: 'l5', style: { left: '18%', top: '7%' }, size: '450px', duration: 15, delay: 0, color: '255, 51, 153' },
    { id: 'l6', style: { left: '55%', top: '15%' }, size: '450px', duration: 15, delay: 0, color: '178, 102, 255' },
];

export default function LeaderboardBackground() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: -1,
                backgroundColor: '#050505',
            }}
        >
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: -1,
                backgroundColor: '#050505'
            }}>
                {/* background lights */}
                {backgroundLights.map((l) => (
                    <motion.div
                        key={l.id}
                        style={{
                            position: 'absolute',
                            ...l.style,
                            width: l.size,
                            height: l.size,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, rgba(${l.color}, 0.45) 0%, rgba(${l.color}, 0) 70%)`,
                            pointerEvents: 'none',
                        }}
                        animate={{
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{
                            duration: l.duration,
                            delay: l.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* trophies */}
                {trophies.map((t) => (
                    <motion.div
                        key={t.id}
                        style={{
                            position: 'absolute',
                            left: t.left,
                            right: t.right,
                            bottom: '-100px',
                            color: '#FBBF24',
                            opacity: 0.25
                        }}
                        animate={{
                            y: ['0vh', '-120vh'],
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: t.duration,
                            delay: t.delay,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <Trophy size={t.size} style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' }} />
                    </motion.div>
                ))}
            </div>
        </motion.div>

    );
}