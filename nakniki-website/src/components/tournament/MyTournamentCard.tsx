import { Flex, Text, Box, Button, Card, Badge } from '@radix-ui/themes';
import { Trophy, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MyTournament } from '../../hooks/useTournamentLobby';
import { TournamentStatus } from '@nakniki/shared';

const STATUS_LABEL: Record<string, { label: string; color: any }> = {
    IN_PROGRESS: { label: 'Live', color: 'green' },
    REGISTERING: { label: 'Registering', color: 'amber' },
    FINISHED: { label: 'Finished', color: 'gray' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
};

export function MyTournamentCard({ tournament, onView, index }: {
    tournament: MyTournament; onView: (id: string) => void; index: number;
}) {
    const s = STATUS_LABEL[tournament.status] ?? { label: tournament.status, color: 'gray' };
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card style={{ padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Flex align="center" justify="between">
                    <Flex align="center" gap="4">
                        <Trophy size={24} color="orange" />
                        <Box>
                            <Text weight="bold" size="4" style={{ display: 'block', marginBottom: 4 }}>{tournament.name}</Text>
                            <Badge color={s.color} variant="soft" radius="full">{s.label}</Badge>
                        </Box>
                    </Flex>
                    
                    { tournament.status !== TournamentStatus.CANCELLED && (<Button size="3" color="gold" onClick={() => onView(tournament.id)} style={{ cursor: 'pointer', borderRadius: 8 }}>
                        <Eye size={16} style={{ marginRight: 6 }} /> View
                    </Button>)}
                </Flex>
            </Card>
        </motion.div>
    );
}