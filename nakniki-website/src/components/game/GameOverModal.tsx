import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { PlayerRole } from '@nakniki/shared';

interface GameOverModalProps {
    isOpen: boolean;
    winner: PlayerRole | null;
    myRole: PlayerRole;
    reason: string;
    onReturnHome: () => void;
}

export function GameOverModal({ isOpen, winner, myRole, reason, onReturnHome }: GameOverModalProps) {
    if (!isOpen) return null;

    const isWinner = winner === myRole;
    const isTie = winner === null;

    // Default to Tie styling
    let titleText = "MATCH OVER";
    let glowColor = "rgba(100, 100, 100, 0.4)"; // Gray
    let mainColor = "#888888";

    // Dynamic theming based on game result
    if (isWinner) {
        titleText = "VICTORY";
        glowColor = "rgba(45, 230, 100, 0.35)"; // Neon Green
        mainColor = "#4ade80";
    } else if (!isTie) {
        titleText = "DEFEAT";
        glowColor = "rgba(230, 45, 45, 0.35)"; // Neon Red
        mainColor = "#f87171";
    }

    // Format the reason text to look like a clean system broadcast (e.g., "OPPONENT_LEFT" -> "OPPONENT LEFT")
    const formattedReason = reason.replace(/_/g, ' ');

    return (
        <Box style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeInOverlay 0.6s ease-out'
        }}>
            <Box style={{
                padding: '50px 60px',
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                border: `1px solid ${mainColor}40`,
                borderRadius: '24px',
                boxShadow: `0 0 100px ${glowColor}, inset 0 0 30px rgba(0,0,0,0.5)`,
                textAlign: 'center',
                minWidth: '450px',
                transform: 'translateY(0)',
                animation: 'slideUpModal 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <Flex direction="column" align="center" gap="4">
                    {/* SUBTITLE: REASON */}
                    <Text size="2" style={{ 
                        color: mainColor, 
                        letterSpacing: '5px', 
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        opacity: 0.8
                    }}>
                        {formattedReason}
                    </Text>

                    {/* MAIN TITLE TEXT */}
                    <Text size="9" weight="bold" style={{
                        color: '#ffffff',
                        letterSpacing: '10px',
                        textShadow: `0 0 25px ${mainColor}`,
                        margin: '10px 0',
                        fontSize: '3.5rem'
                    }}>
                        {titleText}
                    </Text>

                    {/* GLOWING DIVIDER LINE */}
                    <Box style={{ 
                        width: '70%', 
                        height: '2px', 
                        background: `linear-gradient(90deg, transparent, ${mainColor}, transparent)`,
                        marginBottom: '20px',
                        opacity: 0.6
                    }} />

                    {/* INTERACTIVE RETURN BUTTON */}
                    <Button 
                        size="4" 
                        variant="surface"
                        onClick={onReturnHome}
                        style={{
                            cursor: 'pointer',
                            color: '#ffffff',
                            backgroundColor: `${mainColor}15`,
                            border: `1px solid ${mainColor}60`,
                            boxShadow: `0 0 20px ${glowColor}`,
                            padding: '24px 48px',
                            fontSize: '1.1rem',
                            letterSpacing: '2px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${mainColor}30`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 5px 25px ${glowColor}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `${mainColor}15`;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}`;
                        }}
                    >
                        RETURN TO HUB
                    </Button>
                </Flex>
            </Box>

            {/* KEYFRAME ANIMATIONS INJECTED DIRECTLY */}
            <style>{`
                @keyframes fadeInOverlay {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(12px); }
                }
                @keyframes slideUpModal {
                    from { opacity: 0; transform: translateY(60px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </Box>
    );
}