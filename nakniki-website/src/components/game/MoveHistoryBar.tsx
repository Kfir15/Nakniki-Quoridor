import React from 'react';
import { Flex, Text, Box, ScrollArea } from '@radix-ui/themes';
import { HelpCircle, Terminal } from 'lucide-react';

interface MoveHistoryBarProps {
    moveHistory: string[];
}

export const MoveHistoryBar: React.FC<MoveHistoryBarProps> = ({ moveHistory }) => {
    return (
        <Box style={{
            position: 'absolute',
            right: '40px', // Symmetrical with the left sidebar
            top: '50%',
            transform: 'translateY(-50%)', 
            width: '260px',
            height: '60vh', 
            backgroundColor: 'rgba(15, 15, 15, 0.75)', 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 50 
        }}>
            {/* PANEL HEADER */}
            <Box style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <Text size="2" weight="bold" style={{ color: 'white', letterSpacing: '2px', display: 'block' }}>
                    MATCH HISTORY
                </Text>
                <Text size="1" color="gray">
                    Live move log
                </Text>
            </Box>

            {/* SCROLLABLE LOG LIST */}
            <ScrollArea scrollbars="vertical" style={{ flex: 1, padding: '16px' }}>
                <Flex direction="column" gap="2">
                    {moveHistory.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" style={{ height: '200px', opacity: 0.2 }}>
                            <HelpCircle size={24} color="gray" />
                            <Text size="1" color="gray" mt="2">No moves recorded yet</Text>
                        </Flex>
                    ) : (
                        moveHistory.map((move, index) => (
                            <Flex 
                                key={`move-${index}`} 
                                align="center" 
                                style={{
                                    padding: '10px 14px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.03)',
                                    borderRadius: '8px'
                                }}
                            >
                                <Flex align="center" gap="3">
                                    {/* Incremental turn counter using your Gold/Yellow theme */}
                                    <Text size="1" style={{ color: '#FBBF24', fontFamily: 'monospace', fontWeight: 'bold', width: '28px' }}>
                                        {String(index + 1).padStart(2, '0')}.
                                    </Text>
                                    <Flex align="center" gap="1.5">
                                        <Terminal size={12} color="#ef4444" style={{ opacity: 0.7 }} />
                                        <Text size="1" color="gray" style={{ letterSpacing: '0.5px' }}>
                                            ACTION
                                        </Text>
                                    </Flex>
                                </Flex>

                                {/* Render your string coordinate notation directly using your Red theme */}
                                <Text size="2" weight="bold" style={{ fontFamily: 'monospace', color: '#ef4444', letterSpacing: '0.5px' }}>
                                    {move}
                                </Text>
                            </Flex>
                        ))
                    )}
                </Flex>
            </ScrollArea>
        </Box>
    );
};