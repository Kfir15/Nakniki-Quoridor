import { Box, Text } from '@radix-ui/themes';
import { Bot, Users, Trophy, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface NestedModeCardProps {
    id: string; // Used to determine the icon
    title: string;
    subtitle: string;
    color: string;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
}

// Helper to get the correct icon based on ID
const getIcon = (id: string, size: number): ReactNode => {
    switch (id) {
        case 'ai': return <Bot size={size} />;
        case 'mp': return <Users size={size} />;
        case 'tourney': return <Trophy size={size} />;
        default: return <Users size={size} />;
    }
};

export default function NestedModeCard({
    id, title, subtitle, color, isHovered, onHover, onLeave, onClick
}: NestedModeCardProps) {
    const iconSize = 28;

    return (
        <motion.div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            // 👇 Subtler hover animation
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            style={{
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Box style={{
                flexGrow: 1,
                borderRadius: '16px',
                border: `1px solid ${isHovered ? color : 'rgba(255,255,255,0.03)'}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(27, 26, 26, 0.7)',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease-out',
                boxShadow: isHovered
                    ? `0 10px 40px -10px ${color.replace(')', ', 0.2)')}`
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                {/* Top Section: Icon */}
                <Box style={{
                    color: isHovered ? color : 'rgba(255,255,255,0.7)',
                    transition: 'color 0.3s ease'
                }}>
                    {getIcon(id, iconSize)}
                </Box>

                {/* Bottom Section: Text & Arrow */}
                <Box style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginTop: '24px' // Ensures spacing if card gets very short
                }}>
                    <Box style={{ flex: 1 }}>
                        <Text as="div" size="1" style={{
                            color: color,
                            fontWeight: 'bold',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            marginBottom: '4px'
                        }}>
                            {subtitle}
                        </Text>
                        <Text as="div" size="5" weight="bold" style={{ lineHeight: 1.2, color: 'white' }}>
                            {title}
                        </Text>
                    </Box>

                    {/* Animated Arrow */}
                    <motion.div
                        animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{ color: color, flexShrink: 0 }}
                    >
                        <ChevronRight size={24} />
                    </motion.div>
                </Box>
            </Box>
        </motion.div>
    );
}