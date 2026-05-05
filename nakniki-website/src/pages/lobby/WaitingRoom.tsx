import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Flex, Text, Box, Button } from '@radix-ui/themes';
import { Copy, ArrowLeft, CheckCircle2, Radar, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { socketManager } from '../../lib/socket.manager';
import { SOCKET_EVENTS as S } from '@nakniki/shared';
import { ROUTES as R } from '../../constants/routes.constants';


function CyberBackground() {
    // return cyber background with light
    return (
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', backgroundColor: '#030303' }}>

            <motion.div
                animate={{
                    x: [250, 177, 0, -177, -250, -177, 0, 177, 250],
                    y: [0, 177, 250, 177, 0, -177, -250, -177, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    translateX: '-50%',
                    translateY: '-50%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(255, 20, 20, 0.62) 0%, transparent 65%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 1
                }}
            />

            <Box style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2,
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                backgroundPosition: 'center center',
            }} />

            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%', zIndex: 3,
                    width: '850px', height: '850px',
                    background: 'radial-gradient(circle, rgba(255, 51, 51, 0.12) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
                }}
            />
        </Box>
    );
}

function CornerBrackets() {
    // return corner brackets
    const bracketStyle = { width: '40px', height: '40px', opacity: 0.3, position: 'absolute' as const };
    return (
        <>
            <Box style={{ ...bracketStyle, top: '40px', left: '40px', borderTop: '2px solid var(--red-9)', borderLeft: '2px solid var(--red-9)' }} />
            <Box style={{ ...bracketStyle, top: '40px', right: '40px', borderTop: '2px solid var(--red-9)', borderRight: '2px solid var(--red-9)' }} />
            <Box style={{ ...bracketStyle, bottom: '40px', left: '40px', borderBottom: '2px solid var(--red-9)', borderLeft: '2px solid var(--red-9)' }} />
            <Box style={{ ...bracketStyle, bottom: '40px', right: '40px', borderBottom: '2px solid var(--red-9)', borderRight: '2px solid var(--red-9)' }} />
        </>
    );
}

function TypewriterLog() {
    // return lines with typing animation
    const [history, setHistory] = useState<string[]>([]);
    const [activeLine, setActiveLine] = useState('');
    const [poolIndex, setPoolIndex] = useState(0);

    // the lines
    const pool = [
        'Establishing secure handshake...',
        'Nakniki_OS: STATUS_OK (0x0042)',
        'Initializing AI heuristics...',
        'Checking network integrity...',
        'Syncing minimax threads...',
        'Searching for challengers...',
        'AES-256 Tunnel active.',
        'Broadcasting lobby availability...',
        'Node: BAR_ILAN_CS_CENTRAL',
        'Ping: 24ms | Loss: 0%',
        'Verifying game state V4.0...'
    ];

    useEffect(() => {
        let charIndex = 0;
        const fullText = pool[poolIndex % pool.length];

        // typing animation
        const typingInterval = setInterval(() => {
            setActiveLine('> ' + fullText.substring(0, charIndex));
            charIndex++;

            if (charIndex > fullText.length) {
                clearInterval(typingInterval);
                setTimeout(() => {
                    setHistory(prev => [...prev.slice(-3), '> ' + fullText]);
                    setActiveLine('');
                    setPoolIndex(prev => prev + 1);
                }, 1000);
            }
        }, 45);

        return () => clearInterval(typingInterval);
    }, [poolIndex]);

    return (
        <Box style={{
            height: '100px',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, transparent, black 20%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%)'
        }}>
            <Flex direction="column" gap="1" style={{ justifyContent: 'flex-end', height: '100%' }}>
                <AnimatePresence mode="popLayout">
                    {history.map((line, idx) => (
                        <motion.div
                            key={`hist-${poolIndex}-${idx}`}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.3, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <Text size="1" style={{ fontFamily: 'monospace', color: 'gray', fontSize: '10px' }}>
                                {line}
                            </Text>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activeLine && (
                    <motion.div layout transition={{ duration: 0.4 }}>
                        <Text size="1" style={{ fontFamily: 'monospace', color: 'var(--red-9)', fontSize: '10px' }}>
                            {activeLine}
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                                _
                            </motion.span>
                        </Text>
                    </motion.div>
                )}
            </Flex>
        </Box>
    );
}

function TechnicalStatus() {
    return (
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', padding: '40px', zIndex: 5 }}>
            <Flex direction="column" style={{ position: 'absolute', top: '60px', left: '80px' }}>
                <Text size="1" weight="bold" style={{ color: 'var(--red-9)', letterSpacing: '2px' }}>CORE_V3: ACTIVE</Text>
                <Text size="1" color="gray" style={{ opacity: 0.5 }}>LINK: ENCRYPTED</Text>
            </Flex>

            <Flex direction="column" align="end" style={{ position: 'absolute', top: '60px', right: '80px' }}>
                <Text size="1" weight="bold" style={{ color: 'white', letterSpacing: '2px' }}>NAKNIKI_SERVER_01</Text>
                <Text size="1" color="gray" style={{ opacity: 0.5 }}>UPTIME: 99.9%</Text>
            </Flex>

            <Box style={{ position: 'absolute', bottom: '60px', left: '80px', width: '250px' }}>
                <Flex gap="2" align="center" mb="2">
                    <Terminal size={12} color="var(--red-9)" />
                    <Text size="1" weight="bold" style={{ color: 'var(--red-9)', letterSpacing: '1px' }}>SYSTEM_LOG</Text>
                </Flex>
                <TypewriterLog />
            </Box>
        </Box>
    );
}

function RadarPulse() {
    return (
        <Box style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ scale: [0.8, 4], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 1.33, ease: "linear" }}
                    style={{
                        position: 'absolute', width: '64px', height: '64px',
                        borderRadius: '50%', border: '1.5px solid var(--red-9)', boxSizing: 'border-box'
                    }}
                />
            ))}
            <Box style={{
                zIndex: 10, backgroundColor: '#0a0a0a', borderRadius: '50%',
                border: '1px solid var(--red-9)', boxShadow: '0 0 30px rgba(255,51,51,0.4)',
                width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Radar size={24} color="var(--red-9)" />
            </Box>
        </Box>
    );
}

export default function WaitingRoom() {
    const { lobbyType, gameId } = useParams();
    const navigate = useNavigate();
    const [isCopied, setIsCopied] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const socket = socketManager.getSocket();

    // handle the timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // show waiting time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // handle user leact the lobby
    const handleAbort = useCallback(() => {
        if (socket) {
            // update the backend
            socket.emit(S.CLIENT.MP_ABANDON_GAME);
        }
        navigate(R.MP_LOBBY);
    }, [socket, navigate]);

    useEffect(() => {
        if (!socket) return;

        // if opponent joined, start the game
        const handleOpponentJoined = (data: { state: any }) => {
            const gamePath = R.GAME.replace(':gameId', gameId || '');
            navigate(gamePath, { state: { initialState: data.state, isHost: true } });
        };
        socket.on(S.SERVER.OPPONENT_JOINED, handleOpponentJoined);

        return () => {
            socket.off(S.SERVER.OPPONENT_JOINED, handleOpponentJoined);
        };
    }, [navigate, gameId]);

    const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(gameId || '');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [gameId]);

    return (
        <Box style={{
            width: '100vw', height: '100vh', position: 'relative',
            overflow: 'hidden', backgroundColor: '#030303',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <CyberBackground />
            <CornerBrackets />
            <TechnicalStatus />

            <Container size="2" style={{ zIndex: 10, position: 'relative' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Flex direction="column" align="center" style={{
                        backgroundColor: 'rgba(10, 10, 10, 0.85)', padding: '64px 48px', borderRadius: '32px',
                        border: '1px solid rgba(255,51,51,0.1)', backdropFilter: 'blur(24px)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.9)', maxWidth: '520px', margin: '0 auto'
                    }}>
                        <Box mb="6"><RadarPulse /></Box>

                        {/* headline */}
                        <Flex direction="column" align="center" mb="5">
                            <Text size="8" weight="bold" style={{ letterSpacing: '4px', textTransform: 'uppercase', color: 'white', textAlign: 'center' }}>
                                Waiting for
                            </Text>
                            <Text size="8" weight="bold" style={{ letterSpacing: '4px', textTransform: 'uppercase', color: 'white', textAlign: 'center' }}>
                                an opponent
                            </Text>
                        </Flex>

                        {/* timer */}
                        <Text size="8" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', letterSpacing: '2px' }}>
                            {formatTime(elapsedTime)}
                        </Text>

                        {/* print lobby code */}
                        <Box style={{
                            backgroundColor: 'rgba(255,0,0,0.05)', padding: '24px',
                            borderRadius: '20px', border: '1px solid rgba(255,51,51,0.1)', width: '100%'
                        }}>
                            <Text size="1" color="gray" style={{ display: 'block', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                {lobbyType === 'public' ? "Public Access Key" : "Private Access Key"}
                            </Text>
                            <Flex align="center" justify="center" gap="4">
                                <Text size="9" weight="bold" style={{ letterSpacing: '6px', color: 'white' }}>
                                    {gameId}
                                </Text>
                                <Button
                                    variant="soft"
                                    color={isCopied ? "green" : "red"}
                                    onClick={handleCopyCode}
                                    style={{ cursor: 'pointer', height: '48px', width: '48px', borderRadius: '12px' }}
                                >
                                    <AnimatePresence mode="wait">
                                        {isCopied ? (
                                            <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <CheckCircle2 size={24} />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="k" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <Copy size={24} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </Flex>
                        </Box>

                        {/* close lobby btn */}
                        <Button
                            variant="ghost"
                            color="gray"
                            mt="8"
                            size="3"
                            onClick={handleAbort}
                            style={{ cursor: 'pointer' }}
                        >
                            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Close Lobby
                        </Button>
                    </Flex>
                </motion.div>
            </Container>
        </Box>
    );
}