import { Flex, Box, Text, Avatar, Dialog, Separator, Skeleton } from '@radix-ui/themes';
import { Shield, Trophy, Swords, Calendar, Crosshair } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sendGet } from '../services/api';
import { useUser } from '../services/UserContext';
import BackButton from './BackButton';

export interface SearchedUser {
    id: string;
    username: string;
    avatar_url: string | null;
    elo_rating: number;
    total_games: number;
    total_wins: number;
    created_at: string;
}

interface Props {
    user: SearchedUser | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function UserContextPopup({ user, isOpen, onClose }: Props) {
    const { user: currentUser } = useUser();
    const [h2h, setH2h] = useState<{ played: number, yourWins: number, theirWins: number } | null>(null);
    const [loadingH2h, setLoadingH2h] = useState(false);

    useEffect(() => {
        // if the popup open
        if (isOpen && user && currentUser) {

            // fetch H2H stats
            const fetchH2H = async () => {
                setLoadingH2h(true);
                try {
                    // get the stats and set them
                    const response = await sendGet(`/users/h2h/${user.id}`, currentUser.token);
                    if (response.status === 200) setH2h(response.data);
                } catch (err) {
                    console.error("H2H fetch error");
                } finally {
                    setLoadingH2h(false);
                }
            };
            fetchH2H();
        } else {
            setH2h(null);
        }
    }, [isOpen, user, currentUser]);

    if (!user) return null;

    // get playing since format
    const playingSince = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Content size="3" maxWidth="475px">
                <Flex direction="column" gap="4">

                    {/* go back btn */}
                    <Flex justify="start">
                        <Dialog.Close>
                            <BackButton />
                        </Dialog.Close>
                    </Flex>

                    <Flex direction="row" align="center" justify="center" gap="4">
                        {/* show the user avatar */}
                        <Avatar
                            src={user.avatar_url || undefined}
                            fallback={user.username.charAt(0).toUpperCase()}
                            radius="full"
                            size="7"
                        />

                        {/* show username and playing since */}
                        <Flex direction="column" justify="center">
                            <Text size="5"><strong>{user.username}</strong></Text>
                            <Flex align="center" gap="1" style={{ opacity: 0.6, marginTop: '4px' }}>
                                <Calendar size={12} />
                                <Text size="1" weight="bold" style={{ letterSpacing: '1px' }}>
                                    PLAYING SINCE {playingSince.toUpperCase()}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>

                {/* H2H stats */}
                <Box p="3" mt="4" style={{ background: 'rgba(220, 38, 38, 0.05)', borderRadius: '12px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                    <Flex align="center" gap="2" mb="3">
                        <Crosshair size={14} color="var(--red-9)" />
                        <Text size="1" weight="bold" style={{ color: 'var(--red-9)', letterSpacing: '1px' }}>HEAD TO HEAD STATISTICS</Text>
                    </Flex>

                    <Skeleton loading={loadingH2h}>
                        {h2h && h2h.played > 0 ? (
                            <Flex justify="between" align="center" px="4">
                                <Flex direction="column" align="center">
                                    <Text size="1" color="gray" weight="bold">WINS</Text>
                                    <Text size="5" weight="bold">{h2h.yourWins}</Text>
                                </Flex>
                                <Flex direction="column" align="center" style={{ opacity: 0.3 }}>
                                    <Text size="1" weight="bold">VS</Text>
                                    <Text size="1">{h2h.played} TOTAL</Text>
                                </Flex>
                                <Flex direction="column" align="center">
                                    <Text size="1" color="gray" weight="bold">LOSSES</Text>
                                    <Text size="5" weight="bold">{h2h.theirWins}</Text>
                                </Flex>
                            </Flex>
                        ) : (
                            <Text size="1" color="gray" align="center" style={{ width: '100%', display: 'block' }}>
                                {loadingH2h ? "Scanning records..." : "No previous combat data found."}
                            </Text>
                        )}
                    </Skeleton>
                </Box>

                <Box mt="4" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px' }}>
                    <Flex direction="column" gap="3">

                        {/* ELO rating */}
                        <Flex justify="between" align="center">
                            <Flex align="center" gap="2" style={{ color: 'var(--gray-11)' }}>
                                <Shield size={16} />
                                <Text size="2" weight="bold">ELO RATING</Text>
                            </Flex>
                            <Text size="3" weight="bold" style={{ color: 'var(--red-9)' }}>
                                {user.elo_rating}
                            </Text>
                        </Flex>

                        <Separator size="4" style={{ opacity: 0.1 }} />

                        {/* total games played */}
                        <Flex justify="between" align="center">
                            <Flex align="center" gap="2" style={{ color: 'var(--gray-11)' }}>
                                <Swords size={16} />
                                <Text size="2" weight="bold">TOTAL MATCHES</Text>
                            </Flex>
                            <Text size="3" weight="bold" style={{ color: 'white' }}>
                                {user.total_games}
                            </Text>
                        </Flex>

                        <Separator size="4" style={{ opacity: 0.1 }} />

                        {/* total wins */}
                        <Flex justify="between" align="center">
                            <Flex align="center" gap="2" style={{ color: 'var(--gray-11)' }}>
                                <Trophy size={16} />
                                <Text size="2" weight="bold">TOTAL WINS</Text>
                            </Flex>
                            <Text size="3" weight="bold" style={{ color: 'white' }}>
                                {user.total_wins}
                            </Text>
                        </Flex>

                    </Flex>
                </Box>

            </Dialog.Content>
        </Dialog.Root>
    );
}