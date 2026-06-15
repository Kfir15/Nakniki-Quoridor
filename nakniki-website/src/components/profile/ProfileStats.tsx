//needed: ELO, W/L ratio, W/L for P1, W/L for P2, Nemesis (pfp, name, W/L)

import { Avatar, Flex, Text, Box } from "@radix-ui/themes";
import StatCard from "./StatCard";
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

interface StatsProps {
    ELO: number;
    totalGames: number;
    totalWins: number;
    p1Games: number;
    p1Wins: number;
    p2Games: number;
    p2Wins: number;
    nemesis: { pfp: string | undefined, name: string | undefined, wins: number, losses: number }
}



type StatColor = 'green' | 'red' | 'gray';

function winRateColor(winRate: number): StatColor {
    if (winRate > 50) return 'green';
    if (winRate < 50) return 'red';
    return 'gray';                       
}

export default function ProfileStats( { ELO, totalGames, totalWins, p1Games, p1Wins, p2Games, p2Wins, nemesis }: StatsProps ) {
    const totalLosses = totalGames - totalWins
    const winRate = totalGames === 0 ? 0 : Math.round((totalWins / totalGames) * 100);
    const nemesisGames = nemesis.wins + nemesis.losses;
    const nemesisWinRate = Math.round((nemesis.wins / nemesisGames) * 100);
    return (
        <Box style={{
            backgroundColor: 'rgba(15, 15, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px 40px',
            boxShadow: 'inset 0 6px 20px rgba(255,255,255,0.02)',}}>
                <Flex gap="9" align="center" justify="center">
                    <StatCard label="Win Rate" value={winRate + "%"} color={winRateColor(winRate)}></StatCard>
                    <StatCard label="Record" value={`${totalWins}/${totalLosses}`} color={winRateColor(winRate)}></StatCard>
                </Flex>
                <Flex gap="9" align="center" justify="center">
                    <Avatar 
                        src={nemesis.pfp || undefined}
                        fallback={nemesis.name?.charAt(0).toUpperCase() || 'TBD'}
                        size="5"
                        radius="full"
                        style={{ boxShadow: `0 0 15px ${UI.COLORS.P1.GLOW}` }}
                        />
                    <Text size="5" weight="bold" style={{ letterSpacing: '2px' }}>{nemesis.name}</Text>
                    <StatCard label="Record" value={`${nemesis.wins}/${nemesis.losses}`} color={winRateColor(nemesisWinRate)}></StatCard>
                </Flex>
        </Box>
    );
}