import { Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';

import quoridor_board_background from '../../../assets/quoridor_board_background.svg?url';

export default function MatrixBackground() {
    return (
        <Box style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            backgroundColor: '#0a0a0a'
        }}>
            <motion.div
                animate={{
                    backgroundPositionY: ['0px', '250px'],
                    backgroundPositionX: ['0px', '250px']
                }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url("${quoridor_board_background}")`,
                    backgroundSize: '250px 250px',
                    maskImage: 'radial-gradient(circle at center, black 20%, transparent 85%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 85%)',
                }}
            />
        </Box>
    );
}