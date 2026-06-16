import { Avatar, Badge, Button, Flex, Text } from '@radix-ui/themes';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

export interface MatchRowData {
    id: string;
    youName: string;
    opponentName: string;
    opponentAvatar: string | null;
    youWon: boolean;
    isPlayerOne: boolean;
    isAI: boolean;
    date: string;
}

// compact "x ago" formatter
function timeAgo(iso: string): string {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60); if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);  if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);  if (day < 30) return `${day}d ago`;
    const mo = Math.floor(day / 30);  if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(mo / 12)}y ago`;
}

export default function MatchRow({ match, onAnalyze }: { match: MatchRowData; onAnalyze: () => void }) {
    const { youName, opponentName, opponentAvatar, youWon, isPlayerOne, isAI, date } = match;
    const color = youWon ? UI.COLORS.PROFILE.WIN : UI.COLORS.PROFILE.LOSE;
    const leftName = isPlayerOne ? youName : opponentName;
    const rightName = isPlayerOne ? opponentName : youName;

    return (
        <Flex
            align="center"
            gap="4"
            style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: `1px solid ${color}`,
                borderRadius: '12px',
                padding: '26px 26px',
                width: '100%',
                backgroundColor: 'rgba(15, 15, 15, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 6px 20px rgba(255,255,255,0.02)',
                
            }}
        >
            <Avatar
                src={opponentAvatar || undefined}
                fallback={opponentName.charAt(0).toUpperCase()}
                size="5"
                radius="full"
            />

            <Flex align="center" justify="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                <Text size="4" weight={isPlayerOne ? 'bold' : 'regular'} truncate>{leftName}</Text>
                <Text size="5" color="orange">VS</Text>
                <Text size="4" weight={isPlayerOne ? 'regular' : 'bold'} truncate>{rightName}</Text>
                {isAI && <Badge color="gray" variant="soft" size="1">AI</Badge>}
            </Flex>

            <Badge size="3" color={youWon ? 'green' : 'red'} variant="soft" radius="full">
                {youWon ? 'WON' : 'LOST'}
            </Badge>
            <Text size="3" color="gray" style={{ minWidth: '64px', textAlign: 'right' }}>
                {timeAgo(date)}
            </Text>
            <Button size="3" variant="soft" onClick={onAnalyze}>Analyze</Button>
        </Flex>
    );
}
