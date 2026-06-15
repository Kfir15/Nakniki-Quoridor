import { Container, Flex, Box, Text } from '@radix-ui/themes';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import TournamentCard from '../../components/profile/TournamentCard';
import MatchList from '../../components/profile/MatchList';
import type { MatchRowData } from '../../components/profile/MatchRow';

// TEMPORARY mock data so we can see the header while building it.
// Replace with real fetched data (getUser / getUserRank) once the visuals look right.
const MOCK = {
    name: 'Tyrone',
    email: 'Tyrone@Tyrone.Tyrone',
    date: '2026',
    rankData: { isTop: true, rank: '1' },
    elo: 2001,
    avatarURL: null,
};

// TEMP mock stats so we can see ProfileStats while building it.
const MOCK_STATS = {
    ELO: 900,
    totalGames: 40,
    totalWins: 20,
    p1Games: 25,
    p1Wins: 15,
    p2Games: 15,
    p2Wins: 5,
    results: ['W', 'L', 'W', 'W', 'L'] as ('W' | 'L')[],   // oldest -> newest
    // set this to `null` to test the "no rival yet" empty state
    nemesis: null,
};

// TEMP mock tournament data — the real numbers need a `getUserTournaments` endpoint (later).
const MOCK_TOURNEY = {
    played: 7,
    won: 2,
};

// TEMP mock match history (newest first) — real data comes from getMatchHistory later.
const MOCK_MATCHES: MatchRowData[] = [
    { id: '1', youName: 'Tyrone', opponentName: 'Marinus Maximus', opponentAvatar: null, youWon: true,  isPlayerOne: true,  isAI: false, date: '2026-06-15T10:00:00Z' },
    { id: '2', youName: 'Tyrone', opponentName: 'Python AI Engine', opponentAvatar: null, youWon: false, isPlayerOne: false, isAI: true,  date: '2026-06-13T18:30:00Z' },
    { id: '3', youName: 'Tyrone', opponentName: 'Kfir',            opponentAvatar: null, youWon: true,  isPlayerOne: false, isAI: false, date: '2026-06-09T12:00:00Z' },
    { id: '4', youName: 'Tyrone', opponentName: 'Marinus Maximus', opponentAvatar: null, youWon: false, isPlayerOne: true,  isAI: false, date: '2026-05-28T09:00:00Z' },
];

export default function Profile() {
    return (
        <Container size="4" p="5">
            <ProfileHeader
                name={MOCK.name}
                email={MOCK.email}
                date={MOCK.date}
                rankData={MOCK.rankData}
                elo={MOCK.elo}
                hero={true}
                avatarURL={MOCK.avatarURL}
                onClick={() => alert('edit profile clicked')}
            />

            {/* align="stretch" makes the tournament column stretch to the stats box's height */}
            <Flex mt="5" gap="4" align="stretch">
                <Box style={{ flex: '2.3' }}>        {/* the wider stats panel (~70%) */}
                    <ProfileStats
                        totalGames={MOCK_STATS.totalGames}
                        totalWins={MOCK_STATS.totalWins}
                        p1Games={MOCK_STATS.p1Games}
                        p1Wins={MOCK_STATS.p1Wins}
                        p2Games={MOCK_STATS.p2Games}
                        p2Wins={MOCK_STATS.p2Wins}
                        results={MOCK_STATS.results}
                        nemesis={MOCK_STATS.nemesis}
                    />
                </Box>
                <Box style={{ flex: 1 }}>            {/* the narrower tournament sidebar */}
                    <TournamentCard played={MOCK_TOURNEY.played} won={MOCK_TOURNEY.won} />
                </Box>
            </Flex>

            {/* match history */}
            <Flex direction="column" gap="3" mt="6">
                <Text size="2" weight="bold" color="gray" style={{ letterSpacing: '2px' }}>
                    MATCH HISTORY
                </Text>
                <MatchList matches={MOCK_MATCHES} onAnalyze={(id) => alert('analyze match ' + id)} />
            </Flex>
        </Container>
    );
}
