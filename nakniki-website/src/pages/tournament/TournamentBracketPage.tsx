import { Flex, Text, Box } from '@radix-ui/themes';
import { useMemo } from 'react';
import { useUser } from '../../services/UserContext';
import { TournamentStatus } from '@nakniki/shared';
import { TournamentBracket } from '../../components/tournament/TournamentBracket';
import { TournamentBackground } from '../../components/tournament/TournamentBackground';
import { TournamentChampionBanner } from '../../components/tournament/TournamentChampionBanner';
import RefreshButton from '../../components/RefreshButton';

function roundLabel(idx: number, total: number) {
    const fromEnd = total - 1 - idx;
    if (fromEnd === 0) return 'Final';
    if (fromEnd === 1) return 'Semifinals';
    if (fromEnd === 2) return 'Quarterfinals';
    return `Round ${idx + 1}`;
}




export function TournamentBracketPage({ details, refresh }: { details: any; refresh: () => void }) {
    const { user } = useUser();
    const myName = user?.user_metadata?.username ?? null;
    const { tournament, participants, matches } = details;

    // group matches into round-columns (already ordered by round, then slot)
    const rounds = useMemo(() => {
        const byRound = new Map<number, any[]>();
        for (const m of matches) {
            byRound.set(m.round_number, [...(byRound.get(m.round_number) ?? []), m]);
        }
        return [...byRound.entries()].sort((a, b) => a[0] - b[0]).map(([, ms]) => ms);
    }, [matches]);

    // champion
    const champion = tournament.winner_id
        ? participants.find((p: any) => p.user_id === tournament.winner_id)?.user
        : null;

    const championName = champion?.username;
    const championPfp = champion?.avatar_url

    return (

        <Flex direction="column" align="center" gap="6"
          style={{ padding: '32px 0', minHeight: '100%', position: 'relative' }}>
            <TournamentBackground />
            
            <Flex direction="column" align="center" gap="9" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {/* header */}
                {tournament.status === TournamentStatus.FINISHED && champion ? (
                    <TournamentChampionBanner name={championName} pfp={championPfp}></TournamentChampionBanner>
                ) : (
                    <Text size="8" weight="bold">{tournament.name}</Text>
                )}

                <RefreshButton refresh={refresh}/>

                {/* scrollable bracket */}
                <Box style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', flexGrow: 1, paddingBottom: 16 }}>
                    <Flex gap="8" align="stretch" justify="center" 
                    style={{ minWidth: 'min-content', padding: '0 32px', height: '100%' }}>
                        {rounds.map((roundMatches, roundIdx) => (
                            <Flex key={roundIdx} direction="column" gap="4" style={{ minWidth: 300 }}>
                                {/* fixed label on top */}
                                <Text size="2" weight="bold" color="gray" align="center"
                                    style={{ letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0 }}>
                                    {roundLabel(roundIdx, rounds.length)}
                                </Text>
                                <Flex direction="column" justify="center" gap="5" style={{ flexGrow: 1 }}>
                                    {roundMatches.map((m: any) => {
                                        // winner_id (an id) → the winner's NAME (what the card wants)
                                        const winnerName = m.winner_id == null ? null
                                            : (m.winner_id === m.player_1_id ? m.player_1?.username : m.player_2?.username) ?? null;
                                        return (
                                            <TournamentBracket
                                                key={m.id}
                                                p1Name={m.player_1?.username ?? null}
                                                p2Name={m.player_2?.username ?? null}
                                                p1Avatar={m.player_1?.avatar_url ?? null}
                                                p2Avatar={m.player_2?.avatar_url ?? null}
                                                status={m.status}
                                                winner={winnerName}
                                                myName={myName}
                                            />
                                        );
                                    })}
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
}