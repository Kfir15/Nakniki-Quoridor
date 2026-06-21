import { Container, Flex, Box, Text } from '@radix-ui/themes';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import { type NemesisData } from '../../components/profile/NemesisCard';
import TournamentCard from '../../components/profile/TournamentCard';
import MatchList from '../../components/profile/MatchList';
import type { MatchRowData } from '../../components/profile/MatchRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import { sendGet } from '../../services/api';
import { useUser } from '../../services/UserContext';
import { useState, useEffect } from 'react';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';
import EditProfileDialog from '../../components/profile/EditProfileDialogue';
import ProfileBackground from '../../components/profile/ProfileBackground';

function findNemesis(history: any[]): NemesisData | null {
    // save every unique opponent - not including AI
    const opponents = new Map<string, any>();
    for (const m of history) {
        if (m.is_ai_match) continue;
        const opp = m.opponent_data;
        if (opp?.id && opp.head_to_head) opponents.set(opp.id, opp);
    }

    // Select the opponent who won the most vs the user
    let nemesis: any = null;
    for (const opp of opponents.values()) {
        if (opp.head_to_head.theirWins === 0) continue;       // can't have a nemesis that never beat the user
        if (!nemesis || opp.head_to_head.theirWins > nemesis.head_to_head.theirWins) {
            nemesis = opp;
        }
    }

    // Save the data as NemesisData
    if (!nemesis) return null;
    return {
        name: nemesis.username,
        pfp: nemesis.avatar_url ?? undefined,
        wins: nemesis.head_to_head.yourWins,
        losses: nemesis.head_to_head.theirWins,
    };
}

export default function ProfilePage() {
    const { user } = useUser();
    const [profile, setProfile] = useState<any>(null);
    const [rank, setRank] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    
    const fetchProfileData = async () => {
        if (!user?.token) return;

        setIsLoading(true);
        try {
            const [profileRes, rankRes, historyRes, tourneyRes] = await Promise.all([
                sendGet(E.USERS.PROFILE, user.token),
                sendGet(E.USERS.RANK, user.token),
                sendGet(E.MATCHES.HISTORY, user.token),
                sendGet(E.TOURNAMENTS.MINE, user.token),
            ]);

            // set the data
            setProfile(profileRes.data);
            setRank(rankRes.data.rank);
            setHistory(historyRes.data);
            setTournaments(tourneyRes.data);
        } catch (error) {
            console.error("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [user?.token]);

        if (isLoading) return <LoadingSpinner/>;
        if (!profile) return <Text color="red">Couldn't load profile. Try again.</Text>;


        const wonMatches = history.filter(m => m.winner_id === user?.id);
        const p1Matches = history.filter(m => m.is_player_1);
        const p1Wins = history.filter(m => m.is_player_1 && m.winner_id === user?.id);
        const p2Matches = history.filter(m => !m.is_player_1);
        const p2Wins = history.filter(m => !m.is_player_1 && m.winner_id === user?.id);
        const wonTournaments = tournaments.filter(t => t.placement === 1);
        // taking only the last 5 matches and saving them as either W or L in an array
        const last5Matches = history.slice(0, 5).map(m => m.winner_id === user?.id ? 'W' : 'L') as ('W' | 'L')[];
        // remapping match history data into MatchRowData
        const matchRows: MatchRowData[] = history.map(m => ({
            id: m.id,
            youName: m.user_data.username,
            opponentName: m.is_ai_match ? UI.DEFAULTS.BOT.NAME : m.opponent_data.username,
            opponentAvatar: m.is_ai_match ? UI.DEFAULTS.BOT.AVATAR : (m.opponent_data.avatar_url ?? null),
            youWon: m.winner_id === user?.id,
            isPlayerOne: m.is_player_1,
            isAI: m.is_ai_match,
            date: m.created_at,
        }));
        const nemesis = findNemesis(history);
        
    return (
            <Container size="4" p="5">
                <ProfileBackground></ProfileBackground>
                <ProfileHeader
                    name={profile.username}
                    email={user?.email ?? 'No mail detected'}
                    date={profile.created_at}
                    rankData={rank}
                    elo={profile.elo_rating}
                    hero={true}
                    avatarURL={profile.avatar_url}
                    onClick={() => setEditOpen(true)}
                />
    
                {/* align="stretch" makes the tournament column stretch to the stats box's height */}
                <Flex mt="5" gap="4" align="stretch">
                    <Box style={{ flex: '2.3' }}>        {/* stats panel is 70% of the screen */}
                        <ProfileStats
                            totalGames={history.length}
                            totalWins={wonMatches.length}
                            p1Games={p1Matches.length}
                            p1Wins={p1Wins.length}
                            p2Games={p2Matches.length}
                            p2Wins={p2Wins.length}
                            results={last5Matches}
                            nemesis={nemesis}
                        />
                    </Box>
                    <Box style={{ flex: 1 }}>            {/* tournament panel is 30% of the screen */}
                        <TournamentCard played={tournaments.length} won={wonTournaments.length} />
                    </Box>
                </Flex>
    
                {/* match history */}
                <Flex direction="column" gap="3" mt="6">
                    <Text size="2" weight="bold" color="gray" style={{ letterSpacing: '2px' }}>
                        MATCH HISTORY
                    </Text>
                    <MatchList matches={matchRows} onAnalyze={(id) => alert('analyze match ' + id)} />
                </Flex>

                <EditProfileDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    currentUsername={profile.username}
                    currentAvatar={profile.avatar_url}
                    onSaved={fetchProfileData}
                />
            </Container>
        );
}