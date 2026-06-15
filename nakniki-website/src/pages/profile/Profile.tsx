import { Container, Flex } from '@radix-ui/themes';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';

// TEMPORARY mock data so we can see the header while building it.
// Replace with real fetched data (getUser / getUserRank) once the visuals look right.
const MOCK = {
    name: 'Tyrone',
    email: 'Tyrone@Tyrone.Tyrone',
    date: '2026',
    rankData: { isTop: false, rank: '100' },
    elo: 900,
    avatarURL: null,
};

// TEMP mock stats so we can see ProfileStats while building it.
const MOCK_STATS = {
    ELO: 900,
    totalGames: 35,
    totalWins: 20,
    p1Games: 18,
    p1Wins: 12,
    p2Games: 17,
    p2Wins: 8,
    nemesis: { pfp: undefined, name: 'Kfir', wins: 2, losses: 6 },
};

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

            <Flex mt="5" justify="center">
                <ProfileStats
                    ELO={MOCK_STATS.ELO}
                    totalGames={MOCK_STATS.totalGames}
                    totalWins={MOCK_STATS.totalWins}
                    p1Games={MOCK_STATS.p1Games}
                    p1Wins={MOCK_STATS.p1Wins}
                    p2Games={MOCK_STATS.p2Games}
                    p2Wins={MOCK_STATS.p2Wins}
                    nemesis={MOCK_STATS.nemesis}
                />
            </Flex>
        </Container>
    );
}
