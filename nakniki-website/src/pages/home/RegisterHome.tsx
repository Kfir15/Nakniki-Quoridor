import { Container, Flex, Text, Box } from '@radix-ui/themes';
import { Bot, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES as R } from '../../constants/routes.constants';
import FloatingError from '../../components/error/FloatingError';
import NestedModeCard from '../../components/home/register-home/NestedModeCard';
import { useAiGame } from '../../hooks/useAiGame';

export default function RegisteredHome() {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const { startAiGame, isInitializing, error, clearError } = useAiGame();

    const handleMultiplayerClick = () => {
        navigate(R.MP_LOBBY);
    };

    const handleTournamentClick = () => {
        alert("Tournament feature coming soon");
    };

    return (
        <Box style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            overflow: 'hidden',
        }}>
            <Container size="3" p="4" style={{ width: '100%' }}>

                <Flex direction="column" align="center" gap="2" mb="9">
                    <Text size="9" weight="bold" style={{
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        textShadow: '0 0 30px rgba(255,255,255,0.1)'
                    }}>
                        Nakniki Quoridor
                    </Text>
                    <Text size="3" color="gray" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Select Game Mode
                    </Text>
                </Flex>

                <Flex
                    direction={{ initial: 'column', md: 'row' }}
                    gap="5"
                    style={{
                        maxWidth: '1100px',
                        margin: '0 auto',
                        height: '320px'
                    }}
                >

                    <Box style={{
                        flex: '1',
                        height: '100%',
                        backgroundColor: 'rgba(15, 15, 15, 0.7)',
                        borderRadius: '24px',
                        border: '2px solid rgba(73, 64, 64, 0.56)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Flex justify="center" align="center" gap="2" mb="4">
                            <Bot size={16} color="gray" />
                            <Text
                                size="1"
                                weight="bold"
                                style={{
                                    color: 'gray',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Single Player
                            </Text>
                        </Flex>

                        <Flex gap="4" style={{ flexGrow: 1 }}>
                            <NestedModeCard
                                id="ai"
                                title={isInitializing ? "BOOTING_CORE..." : "Training Simulator"}
                                subtitle="VS AI"
                                color="var(--blue-9)"
                                isHovered={hoveredCard === 'ai'}
                                onHover={() => setHoveredCard('ai')}
                                onLeave={() => setHoveredCard(null)}
                                onClick={isInitializing ? () => { } : startAiGame}
                            />
                        </Flex>
                    </Box>

                    <Box style={{
                        flex: '2',
                        height: '100%',
                        backgroundColor: 'rgba(15, 15, 15, 0.7)',
                        borderRadius: '24px',
                        border: '2px solid rgba(73, 64, 64, 0.56)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Flex justify="center" align="center" gap="2" mb="4">
                            <Users size={16} color="gray" />
                            <Text
                                size="1"
                                weight="bold"
                                style={{
                                    color: 'gray',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                MULTIPLAYER
                            </Text>
                        </Flex>

                        <Flex gap="4" style={{ flexGrow: 1 }}>
                            <NestedModeCard
                                id="mp"
                                title="Global Matchmaking"
                                subtitle="VS Player"
                                color="var(--red-9)"
                                isHovered={hoveredCard === 'mp'}
                                onHover={() => setHoveredCard('mp')}
                                onLeave={() => setHoveredCard(null)}
                                onClick={handleMultiplayerClick}
                            />

                            <NestedModeCard
                                id="tourney"
                                title="Championship"
                                subtitle="Tournament"
                                color="var(--yellow-9)"
                                isHovered={hoveredCard === 'tourney'}
                                onHover={() => setHoveredCard('tourney')}
                                onLeave={() => setHoveredCard(null)}
                                onClick={handleTournamentClick}
                            />
                        </Flex>
                    </Box>

                </Flex>
            </Container>
            <FloatingError message={error || ''} onClose={clearError} />
        </Box>
    );
}