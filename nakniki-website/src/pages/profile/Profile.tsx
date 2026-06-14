import { Container } from '@radix-ui/themes';
import ProfileHeader from '../../components/profile/ProfileHeader';

// TEMPORARY mock data so we can see the header while building it.
// Replace with real fetched data (getUser / getUserRank) once the visuals look right.
const MOCK = {
    name: 'kfir',
    email: 'kfir@nakniki.test',
    date: '2026',
    rankData: { isTop: false, rank: '37' },
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
        </Container>
    );
}
