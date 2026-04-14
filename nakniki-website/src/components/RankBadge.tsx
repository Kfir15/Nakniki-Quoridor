import { Badge } from '@radix-ui/themes';
import { RANK_COLORS, RANK_TIERS } from '../constants/ranks.constants';

// return the badge color based on the rank
const getRankColor = (rank: string) => {

    if (RANK_COLORS[rank]) {
        return RANK_COLORS[rank];
    }

    return "gray";
};

export default function RankBadge({ rankData, hero = false }: { rankData: any, hero?: boolean }) {
    if (!rankData) return null;

    // get the badge color
    const color = getRankColor(rankData.rank);

    // get the text to display
    let displayText;
    if (rankData.isTop) {
        displayText = `TOP ${rankData.rank}`;
    } else {
        displayText = `RANK #${rankData.rank}`;
    }

    return (
        // return the badge
        <Badge
            color={color as any}
            variant="soft"
            radius="full"
            style={{
                padding: hero ? '8px 24px' : '2px 12px',
                fontSize: hero ? '22px' : '14px',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: hero ? `0 0 20px rgba(var(--${color}-9), 0.3)` : 'none',
                border: hero ? `1px solid var(--${color}-8)` : 'none'
            }}
        >
            {rankData.rank === RANK_TIERS.UNRANKED ? "Unranked" : displayText}
        </Badge>
    );
}