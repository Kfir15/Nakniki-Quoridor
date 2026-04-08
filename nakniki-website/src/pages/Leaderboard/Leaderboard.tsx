import { Container, Flex, Text, Skeleton } from '@radix-ui/themes';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sendGet } from '../../services/api';
import { useUser } from '../../services/UserContext';
import RankBadge from '../../components/RankBadge';
import UserContextPopup, { type SearchedUser } from '../../components/UserContextPopup';
import LeaderboardTable from '../../components/Leaderboard/LeaderboardTable';
import LeaderboardBackground from '../../components/Leaderboard/LeaderboardBackground';

interface RankData {
    isTop: boolean;
    rank: string;
}

export default function Leaderboard() {
    const { user } = useUser();
    const [topPlayers, setTopPlayers] = useState<SearchedUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
    const [myRank, setMyRank] = useState<RankData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            if (!user?.token) return;

            setIsLoading(true);
            try {
                // get the leaderboard table and also user rank
                const [leaderboardRes, rankRes] = await Promise.all([
                    sendGet('/users/leaderboard', user.token),
                    sendGet('/users/rank', user.token)
                ]);

                // set the data
                if (leaderboardRes.status === 200) setTopPlayers(leaderboardRes.data);
                if (rankRes.status === 200) setMyRank(rankRes.data.rank);
            } catch (error) {
                console.error("Failed to load leaderboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [user?.token]);

    return (
        <>
            <LeaderboardBackground />

            <Container size="3" p="4" style={{ paddingTop: '40px', paddingBottom: '40px' }}>

                {/* headline */}
                <Flex direction="column" align="center" gap="2" mb="6">
                    <Trophy size={48} color="var(--red-9)" style={{ filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.4))' }} />
                    <Text size="8" weight="bold" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Global Standings
                    </Text>
                    <Text size="2" color="gray">The elite operatives of Nakniki Quoridor</Text>
                </Flex>

                {/* personal rank */}
                <Flex direction="column" align="center" justify="center" gap="4" mb="9">
                    <Text size="2" weight="bold" color="gray" style={{ letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.6 }}>
                        Your Current Standing
                    </Text>

                    <Skeleton loading={isLoading} style={{ borderRadius: '40px' }}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <RankBadge rankData={myRank} hero />
                        </motion.div>
                    </Skeleton>
                </Flex>

                {/* leaderboard table */}
                <LeaderboardTable
                    isLoading={isLoading}
                    topPlayers={topPlayers}
                    onUserClick={(player) => setSelectedUser(player)}
                />

            </Container>

            {/* user context popup */}
            <UserContextPopup
                user={selectedUser}
                isOpen={selectedUser !== null}
                onClose={() => setSelectedUser(null)}
            />
        </>
    );
}