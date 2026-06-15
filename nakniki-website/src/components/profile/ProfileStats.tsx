//needed: ELO, W/L ratio, W/L for P1, W/L for P2, Nemesis (pfp, name, W/L)

import { Flex, Box } from "@radix-ui/themes";
import StatCard from "./StatCard";
import NemesisCard, { type NemesisData } from "./NemesisCard";
import FormCard from "./FormCard";

interface StatsProps {
    totalGames: number;
    totalWins: number;
    p1Games: number;
    p1Wins: number;
    p2Games: number;
    p2Wins: number;
    results: ('W' | 'L')[];
    nemesis: NemesisData | null;
}

function winRateColor(winRate: number): string {
    if (winRate > 50) return '#22c55e';
    if (winRate < 50) return '#ef4444';
    return '#9ca3af';                    
}

export default function ProfileStats( { totalGames, totalWins, p1Games, p1Wins, p2Games, p2Wins, results, nemesis }: StatsProps ) {
    
    const rate = (w: number, g: number) => (g === 0 ? 0 : Math.round((w / g) * 100));
    const totalLosses = totalGames - totalWins;
    const p1Losses = p1Games - p1Wins;
    const p2Losses = p2Games - p2Wins;
    
    return (
        <Box style={{
            backgroundColor: 'rgba(15, 15, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px 40px',
            boxShadow: 'inset 0 6px 20px rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',}}
            >
                <Flex gap="9" align="center" justify="center">
                    <StatCard label="Win Rate" value={rate(totalWins, totalGames) + "%"} color={winRateColor(rate(totalWins, totalGames))}></StatCard>
                    <StatCard label="Record" value={`${totalWins}-${totalLosses}`} color={winRateColor(rate(totalWins, totalGames))}></StatCard>
                    <StatCard label="As P1" value={`${p1Wins}-${p1Losses}`} color={winRateColor(rate(p1Wins, p1Games))} />
                    <StatCard label="As P2" value={`${p2Wins}-${p2Losses}`} color={winRateColor(rate(p2Wins, p2Games))} />
                </Flex>
                <Flex gap="9" align="center" justify="center">
                    <NemesisCard nemesis={nemesis}></NemesisCard>
                </Flex>
                <Flex justify={"center"}>
                    <FormCard results={results}></FormCard>
                </Flex>
        </Box>
    );
}