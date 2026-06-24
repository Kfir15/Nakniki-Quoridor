// Need - Single match bracket: username, pfp, match status, winner
import { TournamentMatchStatus as T } from "@nakniki/shared";
import { Flex, Text, Box, Avatar, Badge } from '@radix-ui/themes';
import { motion } from 'framer-motion';

export interface BracketProps {
    p1Name: string | null;
    p2Name: string | null;
    p1Avatar: string | null;
    p2Avatar: string | null;
    status: T; 
    winner: string | null;
    myName?: string | null;
}

function PlayerRow({ name, pfp, isWinner, dim }: any) {
    if (!name) return <Flex align="center" style={{ height: 44, paddingLeft: 12 }}><Text color="gray" size="2">TBD</Text></Flex>;
    return (
        <Flex align="center" justify="between" gap="2" style={{ padding: '6px 12px', opacity: dim ? 0.4 : 1 }}>
            <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                <Avatar src={ pfp ?? undefined } fallback={name?.[0]?.toUpperCase() ?? 'TBD'} size="1" radius="full" />
                <Text size="2" weight={isWinner ? 'bold' : 'regular'} truncate>{name}</Text>
            </Flex>
        </Flex>
    );
}

export function TournamentBracket({ p1Name, p2Name, p1Avatar, p2Avatar, status, winner, myName }: BracketProps) {
    const myMatch = (myName === p1Name) || (myName === p2Name);
    const isP1Winner = (winner != null) && (winner === p1Name);
    const isP2Winner = (winner != null) && (winner === p2Name);
    const isLiveMatch = status === T.IN_PROGRESS
    return (
        <motion.div 
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ position: 'relative' }}>
            {/* live glow */}
            {isLiveMatch && (
                <motion.div 
                    animate={{ opacity: [0.3, 0.8, 0.3] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ position: 'absolute', inset: -2, borderRadius: 12, border: '2px solid orange', pointerEvents: 'none' }} />
            )}
            <Box style={{
                borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)',
                border: myMatch ? '2px solid brown' : '1px solid rgba(255, 255, 255, 0.08)',
            }}>
                <PlayerRow name={p1Name} pfp={p1Avatar} isWinner={isP1Winner} dim={isP2Winner} />
                <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <PlayerRow name={p2Name} pfp={p2Avatar} isWinner={isP2Winner} dim={isP1Winner} />
            </Box>
            {isLiveMatch && <Badge color="orange" variant="solid" radius="full" size="1"
                style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>LIVE</Badge>}
        </motion.div>);
}