//needed: ELO, W/L ratio, W/L for P1, W/L for P2, Nemesis (pfp, name, W/L)

import { Avatar, Flex, Text, Box } from "@radix-ui/themes";

interface StatsProps {
    ELO: number;
    totalGames: number;
    totalWins: number;
    nemesis: { pfp: string | undefined, name: string | undefined, wins: number, losses: number }
}

export default function ProfileStats( { ELO, totalGames, totalWins, nemesis }: StatsProps ) {
    return (
        <Box style={{
            backgroundColor: 'rgba(15, 15, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px 40px',
            boxShadow: 'inset 0 6px 20px rgba(255,255,255,0.02)',}}>
                <Flex>

                </Flex>
        </Box>
    );
}