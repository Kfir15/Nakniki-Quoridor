import { Container, Flex, Text } from '@radix-ui/themes';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EloBadge from '../../components/EloBadge';

// TEMPORARY mock data so we can see the header while building it.
// Replace with real fetched data (getUser / getUserRank) once the visuals look right.
const MOCK = {
    name: 'Tyrone',
    email: 'Tyrone@Tyrone.Tyrone',
    date: '2026',
    rankData: { isTop: false, rank: '100' },
    avatarURL: null,
};

export default function Profile() {
    return (
        <Container size="3" p="5">
            <ProfileHeader
                name={MOCK.name}
                email={MOCK.email}
                date={MOCK.date}
                rankData={MOCK.rankData}
                hero={true}
                avatarURL={MOCK.avatarURL}
                onClick={() => alert('edit profile clicked')}
            />

            {/* TEMP: showcase every ELO tier so we can eyeball icons + colors. Remove later. */}
            <Flex direction="column" gap="3" align="center" mt="6">
                <Text size="2" color="gray">— ELO tier preview (temporary) —</Text>
                {[4, 911, 1337, 1773, 9999].map((elo) => (
                    <EloBadge key={elo} elo={elo} hero />
                ))}
            </Flex>
        </Container>
    );
}
