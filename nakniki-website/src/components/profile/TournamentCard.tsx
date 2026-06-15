import { Flex, Text, Box } from '@radix-ui/themes';
import { Swords, Trophy } from 'lucide-react';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

interface TournamentCardProps {
    played: number;
    won: number;
}

// shared style for each of the two stat boxes
const boxStyle: React.CSSProperties = {
    flex: 1,                       // the two boxes split the column height evenly
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '20px',
};

export default function TournamentCard({ played, won }: TournamentCardProps) {
    return (
        // height: 100% so the column fills the row's stretched height (matching ProfileStats);
        // gap creates the space between the two boxes
        <Flex direction="column" gap="4" style={{ height: '100%' }}>
            {/* tournaments played */}
            <Box style={boxStyle}>
                <Swords size={28} color="white" />
                <Text size="7" weight="bold">{played}</Text>
                <Text size="1" color="gray" align="center" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tournaments Played
                </Text>
            </Box>

            {/* tournaments won — gold trophy */}
            <Box style={{ ...boxStyle, border: `1px solid ${UI.COLORS.PROFILE.GOLD}55` }}>
                <Trophy size={28} color={UI.COLORS.PROFILE.GOLD} />
                <Text size="7" weight="bold" style={{ color: UI.COLORS.PROFILE.GOLD }}>{won}</Text>
                <Text size="1" color="gray" align="center" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tournaments Won
                </Text>
            </Box>
        </Flex>
    );
}
