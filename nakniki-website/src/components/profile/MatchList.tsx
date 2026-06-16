import { Flex, Text } from '@radix-ui/themes';
import MatchRow, { type MatchRowData } from './MatchRow';

interface MatchListProps {
    matches: MatchRowData[];
    onAnalyze: (matchId: string) => void;
}

export default function MatchList({ matches, onAnalyze }: MatchListProps) {
    // case of no matches
    if (matches.length === 0) {
        return (
        <Flex>
            <Text size="1" color="gray">No matches played yet.</Text>
            <Text size="2" color="gray">Go play some matches, Nakniki-noob 🌭</Text>
        </Flex>
        );
    }

    return (
        <Flex direction="column" gap="3">
            {matches.map((m) => (
                <MatchRow key={m.id} match={m} onAnalyze={() => onAnalyze(m.id)} />
            ))}
        </Flex>
    );
}
