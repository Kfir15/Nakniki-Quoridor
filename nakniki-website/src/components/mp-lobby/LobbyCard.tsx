import { useState, useEffect } from 'react';
import { Flex, Text, Box, Button, Card, Badge, Spinner, Avatar } from '@radix-ui/themes';
import { Play, Shield, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { sendGet } from '../../services/api';
import { useUser } from '../../services/UserContext';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';

interface LobbyCardProps {
    lobby: { lobbyCode: string, hostId: string };
    onJoin: (code: string) => void;
    index: number;
}

export function LobbyCard({ lobby, onJoin, index }: LobbyCardProps) {
    const { user } = useUser();
    const [hostData, setHostData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // fetch lobby host profile
        const fetchHost = async () => {
            try {
                // send the request
                const res = await sendGet(`${E.USERS.PROFILE}?id=${lobby.hostId}`, user?.token);
                if (res.data) setHostData(res.data);
            } catch (err) {
                console.error("Failed to fetch host details");
            } finally {
                setLoading(false);
            }
        };
        if (lobby.hostId) fetchHost();
    }, [lobby.hostId, user?.token]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}>
                <Flex align="center" justify="between">
                    <Flex align="center" gap="4">
                        {loading ? (
                            <Flex align="center" gap="4">
                                <Spinner size="3" />
                                <Text color="gray">Loading player...</Text>
                            </Flex>
                        ) : hostData ? (
                            <> {/* show host avatar */}
                                <Avatar
                                    src={hostData.avatar_url}
                                    fallback={hostData.username?.charAt(0).toUpperCase() || '?'}
                                    radius="full"
                                    size="5"
                                    style={{ border: '2px solid rgba(255,255,255,0.1)' }}
                                />
                                <Box>
                                    {/* show host username */}
                                    <Text weight="bold" size="4" style={{ display: 'block', marginBottom: '4px' }}>
                                        {hostData.username}
                                    </Text>

                                    {/* show host elo and lobby code */}
                                    <Flex gap="3" align="center">
                                        <Badge color="blue" variant="soft" radius="full">
                                            <Shield size={12} style={{ marginRight: '4px' }} />
                                            ELO {hostData.elo_rating}
                                        </Badge>
                                        <Text size="2" color="gray" style={{ display: 'flex', alignItems: 'center' }}>
                                            <Hash size={12} style={{ marginRight: '2px' }} />
                                            {lobby.lobbyCode}
                                        </Text>
                                    </Flex>
                                </Box>
                            </>
                        ) : (
                            <Box>
                                {/* if couldnt find the player profile */}
                                <Text weight="bold" size="4">Unknown Player</Text>
                                <Text size="2" color="gray">Match #{lobby.lobbyCode}</Text>
                            </Box>
                        )}
                    </Flex>

                    {/* join lobby btn */}
                    <Button
                        variant="solid"
                        size="3"
                        onClick={() => onJoin(lobby.lobbyCode)}
                        style={{ cursor: 'pointer', borderRadius: '8px' }}
                    >
                        <Play size={16} fill="currentColor" style={{ marginRight: '6px' }} />
                        Join Match
                    </Button>
                </Flex>
            </Card>
        </motion.div>
    );
}