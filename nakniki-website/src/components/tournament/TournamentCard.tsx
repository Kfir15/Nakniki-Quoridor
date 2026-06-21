import { Flex, Text, Box, Button, Card, Badge } from '@radix-ui/themes';
import { Trophy, Users, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TournamentSummary } from '../../hooks/useTournamentLobby';

interface Props {
    tournament: TournamentSummary;
    onJoin: (id: string) => void;
    index: number;
}

export function TournamentCard({ tournament, onJoin, index }: Props) {
    const isFull = tournament.participant_count >= tournament.size;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card style={{ padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Flex align="center" justify="between">
                    <Flex align="center" gap="4">
                        <Flex align="center" justify="center"
                            style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <Trophy size={24} color="orange" />
                        </Flex>
                        <Box>
                            <Text weight="bold" size="4" style={{ display: 'block', marginBottom: 4 }}>
                                {tournament.name}
                            </Text>
                            <Badge color={isFull ? 'red' : 'green'} variant="soft" radius="full">
                                <Users size={12} style={{ marginRight: 4 }} />
                                {tournament.participant_count}/{tournament.size}
                            </Badge>
                        </Box>
                    </Flex>

                    <Button size="3" color="gold" disabled={isFull}
                        onClick={() => onJoin(tournament.id)}
                        style={{ cursor: 'pointer', borderRadius: 8 }}>
                        <Play size={16} fill="currentColor" style={{ marginRight: 6 }} />
                        {isFull ? 'Full' : 'Join'}
                    </Button>
                </Flex>
            </Card>
        </motion.div>
    );
}