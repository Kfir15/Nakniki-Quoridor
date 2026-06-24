import { Flex, Text, Box, Grid } from '@radix-ui/themes';
import { Swords} from 'lucide-react';
import { useMultiplayerLobby } from '../../hooks/useMultiplayerLobby';
import FloatingError from '../../components/error/FloatingError';
import { LobbyCard } from '../../components/mp-lobby/LobbyCard';
import { ActionHub } from '../../components/mp-lobby/ActionHub';
import { LobbyList } from '../../components/lobby/LobbyList';
import { LobbyWrapper } from '../../components/lobby/LobbyWrapper';

export default function MultiplayerLobby() {
    const { lobbies, createLobby, joinLobby, refreshLobbies, isRefreshing, isCreating, error, clearError } = useMultiplayerLobby();

    return (
        <>
            <LobbyWrapper>
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

                    <LobbyList
                        items={lobbies}
                        isRefreshing={isRefreshing}
                        onRefresh={refreshLobbies}
                        title="Public Lobbies"
                        emptyTitle="No active matches found"
                        emptyText="It's quiet right now. Host a public match to invite challengers!"
                        loadingText="searching matches..."
                        renderItem={(lobby, i) => (
                            <LobbyCard key={lobby.lobbyCode} lobby={lobby} onJoin={joinLobby} index={i} />
                        )}
                    />
                </Grid>
            </LobbyWrapper>
            <FloatingError message={error || ''} onClose={clearError} />
        </>
    );
}