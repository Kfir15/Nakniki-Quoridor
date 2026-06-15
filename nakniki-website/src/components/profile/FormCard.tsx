import { Flex, Box, Text } from "@radix-ui/themes";
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

export default function FormCard({ results }: { results: ('W' | 'L')[] }) {
    
    if (results.length === 0) return <Text size="1" color="gray">No games yet</Text>;

    return (
        <Flex gap="2">
            {results.map((r, i) => (
                <Box key={i} style={{
                    width: 52, height: 52, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 24,
                    background: r === 'W' ? UI.COLORS.PROFILE.BG.WIN : UI.COLORS.PROFILE.BG.LOSE,
                    color: r === 'W' ? UI.COLORS.PROFILE.WIN : UI.COLORS.PROFILE.LOSE,
                    border: `1px solid ${r === 'W' ? UI.COLORS.PROFILE.WIN : UI.COLORS.PROFILE.LOSE}`,
                }}>{r}</Box>
            ))}
        </Flex>
    );
    
}