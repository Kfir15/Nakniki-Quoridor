import { Flex, Text, Box, Avatar } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trophy, Cpu } from 'lucide-react';

export interface SidebarPlayerData {
    username: string;
    avatar_url?: string;
    elo_rating: number;
    total_wins: number;
    isAi?: boolean;
}

interface PlayerCardProps {
    label: string;
    data: SidebarPlayerData;
    time: string;
    isActive: boolean;
}

export default function PlayerCard({ label, data, time, isActive }: PlayerCardProps) {
    
    // if this is ai, change his data
    const finalData = data.isAi ? {
        username: "NAKNIKI BOT",     
        elo_rating: 9999,                
        avatar_url: "/bot-avatar.png",
        total_wins: 9999,
        isAi: true
    } : data;

    return (
        <Box style={{ 
            padding: '24px', 
            position: 'relative',
            background: isActive 
                ? 'linear-gradient(90deg, rgba(138, 28, 28, 0.1) 0%, transparent 100%)' 
                : 'transparent',
            // Unified red border
            borderLeft: isActive 
                ? '3px solid #ef4444' 
                : '3px solid transparent',
            transition: 'all 0.4s ease'
        }}>
            <Text size="1" color="gray" style={{ letterSpacing: '2px', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                {label}
            </Text>
            
            {/* show the user avatar */}
            <Flex align="center" gap="4">
                <Box style={{ position: 'relative' }}>
                    <Avatar 
                        src={finalData.avatar_url} 
                        fallback={finalData.username.charAt(0).toUpperCase()} 
                        radius="full" 
                        size="5" 
                        style={{ 
                            border: `1px solid ${isActive ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: isActive ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none',
                        }}
                    />
                    {finalData.isAi && (
                        <motion.div 
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px',
                                backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #0a0a0a'
                            }}
                        />
                    )}
                </Box>
                

                {/* show the user name, elo and wins */}
                <Box style={{ flex: 1 }}>
                    <Text size="3" weight="bold" style={{ color: 'white', display: 'block', marginBottom: '4px' }}>
                        {finalData.username}
                    </Text>
                    <Flex gap="3">
                        <Flex align="center" gap="1">
                            <Shield size={12} color="#ef4444" />
                            <Text size="1" color="gray">ELO {finalData.elo_rating}</Text>
                        </Flex>
                        <Flex align="center" gap="1">
                            <Trophy size={12} color="#FBBF24" />
                            <Text size="1" color="gray">{finalData.total_wins} WINS</Text>
                        </Flex>
                    </Flex>
                </Box>
            </Flex>

            <Flex justify="end" mt="3" style={{ minHeight: '24px' }}>
                <AnimatePresence mode="wait">
                    {finalData.isAi ? ( 
                        isActive && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Cpu size={14} color="#ef4444" className="animate-spin" />
                                <Text size="1" weight="bold" style={{ color: '#ef4444', letterSpacing: '1px', fontFamily: 'monospace' }}>
                                    THINKING...
                                </Text>
                            </motion.div>
                        )
                    ) : (
                        // show the timer 
                        <motion.div 
                            animate={isActive ? { y: [0, -3, 0], scale: [1, 1.05, 1], opacity: [1, 0.7, 1] } : { y: 0, scale: 1, opacity: 1 }} 
                            transition={isActive ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : { duration: 0.3 }}
                            style={{ transformOrigin: 'right center' }}
                        >
                            <Text size="6" weight="bold" style={{ fontFamily: 'monospace', color: isActive ? 'white' : 'gray' }}>
                                {time}
                            </Text>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Flex>
        </Box>
    );
}