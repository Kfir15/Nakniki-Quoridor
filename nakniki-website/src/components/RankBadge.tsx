import { Badge } from '@radix-ui/themes';

// return the badge color based on the rank
const getRankColor = (rank: string) => {
    if (rank === "1") return "yellow";
    if (rank === "2") return "gray";
    if (rank === "3") return "orange";

    const numericRank = parseInt(rank, 10);
    if (!isNaN(numericRank) && numericRank <= 15) return "red";

    switch (rank) {
        case "50": return "purple";
        case "100": return "indigo";
        case "500": return "blue";
        case "1k": return "cyan";
        case "5k": return "teal";
        case "10k": return "green";
        default: return "gray";
    }
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
            color={color}
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
            {rankData.rank === "Unranked" ? "Unranked" : displayText}
        </Badge>
    );
}