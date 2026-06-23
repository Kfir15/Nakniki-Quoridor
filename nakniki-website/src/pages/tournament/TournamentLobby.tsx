import { Flex, Text, Box, Grid } from '@radix-ui/themes';
import { Trophy } from 'lucide-react';
import { useTournamentLobby } from '../../hooks/useTournamentLobby';
import FloatingError from '../../components/error/FloatingError';
import { LobbyWrapper } from '../../components/lobby/LobbyWrapper';
import { LobbyList } from '../../components/lobby/LobbyList';
import { TournamentCard } from '../../components/tournament/TournamentCard';
import { TournamentActionHub } from '../../components/tournament/TournamentActionHub';
import { ROUTES as R } from '../../constants/routes.constants';
import { useNavigate } from 'react-router-dom';

export default function TournamentLobby() {
    const navigate = useNavigate();
    const {
        tournaments, createTournament, refreshTournaments,
        isRefreshing, isCreating, error, clearError,
    } = useTournamentLobby();

    return (
        <>
            <LobbyWrapper>
                {/* headline */}
                <Box mb="7" style={{ flexShrink: 0 }}>
                    <Flex align="center" gap="3" mb="2">
                        <Flex align="center" justify="center"
                            style={{ width: 48, height: 48, backgroundColor: 'gold', borderRadius: 12 }}>
                            <Trophy size={28} color="black" />
                        </Flex>
                        <Text size="8" weight="bold" style={{ letterSpacing: '-0.5px' }}>Tournaments League</Text>
                    </Flex>
                    <Text size="3" color="gray">Join an open tournament, or start a new one</Text>
                </Box>

                <Grid columns={{ initial: '1', md: '12' }} gap="6" style={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                    <Box style={{ gridColumn: 'span 4' }}>
                        <TournamentActionHub createTournament={createTournament} isCreating={isCreating} />
                    </Box>

                    <LobbyList
                        items={tournaments}
                        isRefreshing={isRefreshing}
                        onRefresh={refreshTournaments}
                        title="Open tournaments"
                        emptyTitle="No open tournaments found"
                        emptyText="It's quiet right now. Start a new tournament and become a champion!"
                        loadingText="searching matches..."
                        renderItem={(t, i) => (
                            <TournamentCard 
                                key={t.id} 
                                tournament={t} 
                                onJoin={(id) => navigate(R.TOURNAMENT_DETAIL.replace(':id', id))} 
                                index={i} />
                        )}
                    />
                </Grid>
            </LobbyWrapper>

            <FloatingError message={error || ''} onClose={clearError} />
        </>
    );
}