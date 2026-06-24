// pages/tournament/BracketTest.tsx  (temporary — delete when done)
import { Flex } from '@radix-ui/themes';
import { TournamentMatchStatus as T } from '@nakniki/shared';
import { TournamentBracket } from '../../components/tournament/TournamentBracket';

export default function BracketTest() {
    return (
        <Flex direction="column" gap="6" style={{ padding: 40, maxWidth: 320, margin: '0 auto' }}>
            {/* live + it's MY match (accent ring + glow + LIVE) */}
            <TournamentBracket p1Name="Alice" p2Name="Bob" p1Avatar={null} p2Avatar={null} status={T.IN_PROGRESS} winner={null} myName="Alice" />
            {/* finished — Charlie won (bold), Dana dimmed */}
            <TournamentBracket p1Name="Charlie" p2Name="Dana" p1Avatar={null} p2Avatar={null} status={T.FINISHED} winner="Charlie" myName={null} />
            {/* ready, no winner yet */}
            <TournamentBracket p1Name="Eve" p2Name="Frank" p1Avatar={null} p2Avatar={null} status={T.READY} winner={null} myName={null} />
            {/* pending — both slots empty (TBD) */}
            <TournamentBracket p1Name={null} p2Name={null} p1Avatar={null} p2Avatar={null} status={T.PENDING} winner={null} myName={null} />
        </Flex>
    );
}