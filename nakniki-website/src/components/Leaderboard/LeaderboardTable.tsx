import { Box, Flex, Text, Avatar, Skeleton, Table } from '@radix-ui/themes';
import { Trophy, Medal } from 'lucide-react';
import { type SearchedUser } from '../UserContextPopup';
import styles from './LeaderboardTable.module.css';

interface LeaderboardTableProps {
    isLoading: boolean;
    topPlayers: SearchedUser[];
    onUserClick: (player: SearchedUser) => void;
}

export default function LeaderboardTable({ isLoading, topPlayers, onUserClick }: LeaderboardTableProps) {
    // get icon base on the rank
    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy size={20} color="#FBBF24" />;
        if (index === 1) return <Medal size={20} color="#9CA3AF" />;
        if (index === 2) return <Medal size={20} color="#B45309" />;

        return <Text size="3" weight="bold" style={{ opacity: 0.5, width: '20px', textAlign: 'center' }}>{index + 1}</Text>;
    };

    // date format
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <Box className={styles.tableContainer}>
            <Table.Root variant="ghost" size="3">

                {/* define the table header */}
                <Table.Header>
                    <Table.Row className={styles.headerRow}>
                        <Table.ColumnHeaderCell className={styles.rankHeader}>Rank</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Player</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="center">Elo</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="center">Matches</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="center">Wins</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="center">Enlisted</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>

                {/* the table body */}
                <Table.Body>
                    {isLoading ? ( // while loading show skeleton
                        Array.from({ length: 5 }).map((_, i) => (
                            <Table.Row key={i}>
                                <Table.Cell><Skeleton width="20px" height="20px" /></Table.Cell>
                                <Table.Cell><Flex gap="3" align="center"><Skeleton width="32px" height="32px" style={{ borderRadius: '50%' }} /><Skeleton width="100px" height="20px" /></Flex></Table.Cell>
                                <Table.Cell align="center"><Skeleton width="40px" height="20px" /></Table.Cell>
                                <Table.Cell align="center"><Skeleton width="30px" height="20px" /></Table.Cell>
                                <Table.Cell align="center"><Skeleton width="30px" height="20px" /></Table.Cell>
                                <Table.Cell align="center"><Skeleton width="60px" height="20px" /></Table.Cell>
                            </Table.Row>
                        ))
                    ) : ( // show the players
                        topPlayers.map((player, index) => {
                            const isRankOne = index === 0;
                            return (
                                <Table.Row key={player.id} align="center">
                                    <Table.Cell style={{ textAlign: 'center' }} /* rank */>
                                        {getRankIcon(index)}
                                    </Table.Cell>

                                    <Table.Cell className={styles.operativeCell} /* avatar + username */>
                                        <Flex
                                            align="center"
                                            gap="3"
                                            onClick={() => onUserClick(player)}
                                            className={styles.operativeFlex}
                                        >
                                            <Avatar
                                                src={player.avatar_url || undefined}
                                                fallback={player.username.charAt(0).toUpperCase()}
                                                size="2"
                                                radius="full"
                                                className={`${styles.avatar} ${isRankOne ? styles.avatarRankOne : ''}`}
                                            />
                                            <Text
                                                size="3"
                                                weight="bold"
                                                className={`${styles.username} ${isRankOne ? styles.usernameRankOne : ''}`}
                                            >
                                                {player.username}
                                            </Text>
                                        </Flex>
                                    </Table.Cell>

                                    <Table.Cell align="center" /* elo */>
                                        <Text size="3" weight="bold" className={styles.eloText}>{player.elo_rating}</Text>
                                    </Table.Cell>

                                    <Table.Cell align="center" /* total games */>
                                        <Text size="2" color="gray">{player.total_games}</Text>
                                    </Table.Cell>

                                    <Table.Cell align="center" /* total wins */>
                                        <Text size="2" color="gray">{player.total_wins}</Text>
                                    </Table.Cell>

                                    <Table.Cell align="center" /* play since */>
                                        <Text size="2" color="gray">{formatDate(player.created_at)}</Text>
                                    </Table.Cell>

                                </Table.Row>
                            );
                        })
                    )}
                </Table.Body>
            </Table.Root>
        </Box>
    );
}