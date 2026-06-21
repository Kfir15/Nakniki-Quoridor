import { Flex, Text, Box, Button, Card, Badge, Spinner, Grid, Separator } from '@radix-ui/themes';
import { RefreshCcw, Users, Swords, Globe } from 'lucide-react';
import { useMultiplayerLobby } from '../../hooks/useMultiplayerLobby';
import FloatingError from '../../components/error/FloatingError';
import { motion, AnimatePresence } from 'framer-motion';
import { LobbyCard } from '../../components/mp-lobby/LobbyCard';
import { ActionHub } from '../../components/mp-lobby/ActionHub';

export default function MultiplayerLobby() {
    const { lobbies, createLobby, joinLobby, refreshLobbies, isRefreshing, isCreating, error, clearError } = useMultiplayerLobby();

    return (
        <Box style={{
            width: '100%',
            flexGrow: 1,
            height: '100%',
            maxHeight: 'calc(100vh - 150px)',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            boxSizing: 'border-box'
        }}>

            <Flex direction="column" style={{
                width: '100%',
                maxWidth: '1136px',
                height: '100%',
                margin: '0 auto',
                padding: '32px 24px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                minHeight: 0
            }}>

                {/* page headline */}
                <Box mb="7" style={{ flexShrink: 0 }}>
                    <Flex align="center" gap="3" mb="2">
                        <Flex
                            align="center"
                            justify="center"
                            style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'var(--accent-9)',
                                borderRadius: '12px'
                            }}
                        >
                            <Swords size={28} color="white" />
                        </Flex>
                        <Text size="8" weight="bold" style={{ letterSpacing: '-0.5px' }}>
                            Multiplayer Arena
                        </Text>
                    </Flex>
                    <Text size="3" color="gray">
                        Host a new match, join an open lobby, or connect with a private code.
                    </Text>
                </Box>

                <Grid columns={{ initial: '1', md: '12' }} gap="6" style={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>

                    {/* action hube */}
                    <Box style={{ gridColumn: 'span 4' }}>
                        <ActionHub
                            createLobby={createLobby}
                            joinLobby={joinLobby}
                            isCreating={isCreating}
                        />
                    </Box>

                    <Flex direction="column" style={{ gridColumn: 'span 8', height: '100%', overflow: 'hidden', minHeight: 0 }}>

                        {/* active lobbies list */}
                        <Box style={{ flexShrink: 0 }}>
                            <Flex justify="between" align="center" mb="4">
                                <Flex align="center" gap="3">
                                    <Text size="5" weight="bold">Public Lobbies</Text>
                                    <Badge color="green" variant="soft" radius="full">
                                        <Users size={12} style={{ marginRight: '4px' }} />
                                        {lobbies.length} Open
                                    </Badge>
                                </Flex>
                                <Button variant="ghost" color="gray" onClick={refreshLobbies} disabled={isRefreshing} style={{ cursor: 'pointer' }}>
                                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                                    Refresh List
                                </Button>
                            </Flex>
                            <Separator size="4" mb="4" style={{ opacity: 0.2 }} />
                        </Box>

                        <Flex
                            direction="column"
                            gap="3"
                            style={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                paddingRight: '12px',
                                paddingBottom: '12px'
                            }}
                        >
                            <AnimatePresence mode="popLayout">
                                {isRefreshing && lobbies.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <Flex justify="center" align="center" p="9" direction="column" gap="4">
                                            <Spinner size="3" />
                                            <Text color="gray">Searching for matches...</Text>
                                        </Flex>
                                    </motion.div>
                                ) : lobbies.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <Card style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                            <Globe size={40} color="gray" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                                            <Text weight="bold" size="4" style={{ display: 'block', marginBottom: '8px' }}>
                                                No active matches found
                                            </Text>
                                            <Text color="gray" size="2">
                                                It's quiet right now. Host a public match to invite challengers!
                                            </Text>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    lobbies.map((lobby, i) => (
                                        <LobbyCard key={lobby.lobbyCode} lobby={lobby} onJoin={joinLobby} index={i} />
                                    ))
                                )}
                            </AnimatePresence>
                        </Flex>
                    </Flex>
                </Grid>
            </Flex>

            <FloatingError message={error || ''} onClose={clearError} />
        </Box>
    );
}