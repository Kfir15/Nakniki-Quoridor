import { Box, Container, Flex, Text, Button } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerRole } from '@nakniki/shared';
import BoardBackground from '../../components/home/register-home/BoardBackground';
import Pawn from '../../components/game/Pawn';
import { ROUTES as R } from '../../constants/routes.constants';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';
import './UnregisterHome.css';

// one call-to-action button that reveals its game pawn (with an LED glow) on hover
interface CtaButtonProps {
    label: string;
    icon: React.ReactNode;
    player: PlayerRole;   // P1 -> red pawn, P2 -> yellow pawn
    glow: string;         // radial glow color behind the pawn
    className: string;    // uh-btn-login / uh-btn-signup
    onClick: () => void;
}

function CtaButton({ label, icon, player, glow, className, onClick }: CtaButtonProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="uh-btn-wrap"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* the floating pawn appears only while hovered */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        className="uh-pawn-halo"
                        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
                        initial={{ opacity: 0, scale: 0.4, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.4, y: 12 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <Pawn player={player} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Button className={`uh-btn ${className}`} onClick={onClick}>
                {icon}
                {label}
            </Button>
        </div>
    );
}

export default function UnregisterHome() {
    const navigate = useNavigate();

    const handleLoginClick = () => navigate(R.LOGIN);
    const handleSignUpClick = () => navigate(R.SIGNUP);

    return (
        <Box style={{
            width: '100%',
            minHeight: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>
            <BoardBackground />

            <Container size="3" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <Flex direction="column" align="center" gap="6">

                        <img src="/nakniki-logo.png" alt="Nakniki" className="uh-logo" />

                        <Text size="9" weight="bold" className="uh-title">
                            <span className="uh-title-white">NAKNIKI</span>{' '}
                            <span className="uh-title-red">QUORIDOR</span>
                        </Text>

                        <Text size="4" className="uh-subtitle">
                            THE HIGHEST SELLING NAKNIKI-BOARDGAME WORLDWIDE!
                        </Text>

                        <Flex gap="7" mt="5">
                            <CtaButton
                                label="Log in"
                                icon={<LogIn size={18} />}
                                player={PlayerRole.P1}
                                glow={UI.COLORS.P1.GLOW}
                                className="uh-btn-login"
                                onClick={handleLoginClick}
                            />
                            <CtaButton
                                label="Sign up"
                                icon={<UserPlus size={18} />}
                                player={PlayerRole.P2}
                                glow={UI.COLORS.P2.GLOW}
                                className="uh-btn-signup"
                                onClick={handleSignUpClick}
                            />
                        </Flex>

                    </Flex>
                </motion.div>
            </Container>
        </Box>
    );
}
