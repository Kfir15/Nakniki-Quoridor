import { Badge } from '@radix-ui/themes';
import type { ComponentType } from 'react';
import { getEloTier } from '../constants/elo.constants';

interface EloBadgeProps {
    elo: number;
    hero?: boolean;       // bigger, glowing version for the profile header
    showLabel?: boolean;  // show the tier name (e.g. "NAKNIKI-GOD") next to the number
}

export default function EloBadge({ elo, hero = false, showLabel = true }: EloBadgeProps) {
    const tier = getEloTier(elo);
    // ElementType is a union including HTML tags, which won't accept `size` at render.
    // Cast to a component-that-takes-size (the runtime value already is one).
    const Icon = tier.Icon as ComponentType<{ size?: number | string }>;

    return (
        <Badge
            radius="full"
            variant="soft"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: hero ? '10px' : '6px',
                color: tier.color,                       // also tints the icons (they use currentColor)
                backgroundColor: `${tier.color}1f`,      // ~12% tint of the tier color
                border: `1px solid ${tier.color}`,
                padding: hero ? '8px 22px' : '4px 12px',
                fontSize: hero ? '22px' : '14px',
                fontWeight: 800,
                letterSpacing: '1px',
                boxShadow: hero ? `0 0 20px ${tier.color}66` : 'none',
            }}
        >
            <Icon size={hero ? 24 : 16} />
            {elo}
            {showLabel && <span style={{ opacity: 0.85 }}>{tier.label.toUpperCase()}</span>}
        </Badge>
    );
}
