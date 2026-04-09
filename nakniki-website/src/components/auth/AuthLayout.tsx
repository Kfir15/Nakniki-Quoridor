import React, { memo } from 'react';
import { Grid, Flex, Box, Heading } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useOutlet, useNavigate } from 'react-router-dom';
import BackButton from '../BackButton';
import HeroBoard from './HeroBoard';
import { ROUTES as R } from '../../constants/routes.constants'

const MemoizedHeroBoard = memo(HeroBoard);

export default function AuthLayout() {
    const location = useLocation();
    const outlet = useOutlet();
    const navigate = useNavigate();

    return (
        <Grid columns={{ initial: '1', md: '2' }} style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>

            <Box style={{ position: 'absolute', top: '7px', left: '24px', zIndex: 20 }}>
                <BackButton onClick={() => navigate(R.HOME)} />
            </Box>

            {/* left side of the screen, 3D model */}
            <Flex
                align="center"
                justify="center"
                display={{ initial: 'none', md: 'flex' }}
                style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                    borderRight: '1px solid var(--gray-5)',
                    overflow: 'hidden'
                }}
            >
                {/* print the 3D model */}
                <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'grab', zIndex: 1 }}>
                    <MemoizedHeroBoard />
                </Box>

                {/* print header */}
                <Box style={{
                    position: 'absolute',
                    top: '20%',
                    textAlign: 'center',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <Heading size="9" style={{
                        letterSpacing: '-2px',
                        color: 'var(--red-9)',
                        textShadow: '0 4px 24px rgba(0,0,0,0.8)'
                    }}>
                        NAKNIKI QUORIDOR
                    </Heading>
                </Box>
            </Flex>

            {/* right side of the screen - signup OR login */}
            <Flex
                align="center"
                justify="center"
                p={{ initial: '4', md: '8' }}
                style={{ position: 'relative', background: 'var(--gray-1)', overflowY: 'auto', overflowX: 'hidden' }}
            >
                <Box style={{ width: '100%', maxWidth: '420px', minHeight: '550px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            style={{ width: '100%' }}
                        >
                            {outlet && React.cloneElement(outlet, { key: location.pathname })}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Flex>

        </Grid>
    );
}