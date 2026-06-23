import { Flex, Text, Box, Button, Card, Badge, Avatar, Separator } from '@radix-ui/themes';
import { Trophy, Users, Shield, Check } from 'lucide-react';
import { useState } from 'react';
import { sendPost } from '../../services/api';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';
import { useUser } from '../../services/UserContext';

interface Participant {
    user_id: string;
    user: { username: string; avatar_url: string | null; elo_rating: number };
}
interface Props {
    details: { tournament: { id: string; name: string; size: number }; participants: Participant[] };
    refresh: () => void;
}

export function TournamentRegisteringPage({ details, refresh }: Props) {
    const { tournament, participants } = details;
    const { user } = useUser();
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isParticipant = participants.some(p => p.user_id === user?.id);
    const isFull = participants.length >= tournament.size;
    const spotsLeft = tournament.size - participants.length;

    
    const handleJoin = async () => {
        setIsJoining(true);
        try {
            await sendPost(E.TOURNAMENTS.JOIN(tournament.id), user?.token);
            refresh();
        } catch (e: any) {
            setError(e?.response?.data?.error ?? 'Failed to join.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Flex direction="column" align="center" gap="6" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
            {/* header */}
            <Flex direction="column" align="center" gap="2">
                <Trophy size={48} color="var(--accent-9)" />
                <Text size="8" weight="bold">{tournament.name}</Text>
                <Badge color="amber" variant="soft" radius="full" size="2">Registering</Badge>
            </Flex>

            {/* fill status */}
            <Flex direction="column" align="center" gap="2">
                <Badge color={isFull ? 'green' : 'gray'} variant="soft" radius="full" size="2">
                    <Users size={14} style={{ marginRight: 4 }} /> {participants.length} / {tournament.size}
                </Badge>
                <Text color="gray" size="2">
                    {isFull ? 'Tournament is full — starting soon!' : `Waiting for ${spotsLeft} more player${spotsLeft === 1 ? '' : 's'}…`}
                </Text>
            </Flex>

            {/* join button or "you're in" */}
            {isParticipant ? (
                <Badge color="green" variant="soft" size="3" radius="full">
                    <Check size={16} style={{ marginRight: 6 }} /> You're in — waiting for the bracket
                </Badge>
            ) : (
                <Button size="4" onClick={handleJoin} disabled={isJoining || isFull} style={{ cursor: 'pointer' }}>
                    <Trophy size={18} style={{ marginRight: 8 }} /> {isFull ? 'Full' : 'Join Tournament'}
                </Button>
            )}
            {error && <Text color="red" size="2">{error}</Text>}

            <Separator size="4" style={{ opacity: 0.2, width: '100%' }} />

            {/* roster */}
            <Box style={{ width: '100%' }}>
                <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>Players</Text>
                <Flex direction="column" gap="2">
                    {participants.map(p => (
                        <Card key={p.user_id} style={{ padding: 12 }}>
                            <Flex align="center" justify="between">
                                <Flex align="center" gap="3">
                                    <Avatar src={p.user.avatar_url ?? undefined}
                                        fallback={p.user.username?.charAt(0).toUpperCase() ?? '?'} radius="full" size="3" />
                                    <Text weight="bold">{p.user.username}</Text>
                                </Flex>
                                <Badge color="blue" variant="soft" radius="full">
                                    <Shield size={12} style={{ marginRight: 4 }} /> {p.user.elo_rating}
                                </Badge>
                            </Flex>
                        </Card>
                    ))}
                    {/* empty slots so the size is visible */}
                    {Array.from({ length: spotsLeft }).map((_, i) => (
                        <Card key={`empty-${i}`} style={{ padding: 12, opacity: 0.4, border: '1px dashed rgba(255,255,255,0.15)' }}>
                            <Text color="gray" size="2">Empty slot</Text>
                        </Card>
                    ))}
                </Flex>
            </Box>
        </Flex>
    );
}