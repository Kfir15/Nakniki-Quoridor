import { Baby, User, GraduationCap, Crown } from 'lucide-react';
import { GiHotDog } from 'react-icons/gi';
import type { ElementType } from 'react';

export interface EloTier {
    min: number;       // lowest ELO that belongs to this tier
    label: string;
    color: string;
    Icon: ElementType; // any renderable icon component (lucide / emoji wrapper / react-icons)
}

// ordered low -> high. `min` is the inclusive floor of each band.
export const ELO_TIERS: EloTier[] = [
    { min: 0,    label: 'Baby',                 color: '#ec4899', Icon: Baby },
    { min: 801,  label: 'Beginner',             color: '#65d16b', Icon: User },
    { min: 1201, label: 'Intermediate',         color: '#3b82f6', Icon: GraduationCap },
    { min: 1601, label: 'Expert',               color: '#fbbf24', Icon: Crown },
    { min: 2001, label: 'Nakniki-God',          color: '#f97316', Icon: GiHotDog }
];

// return the tier an ELO value falls into
export function getEloTier(elo: number): EloTier {
    for (let i = ELO_TIERS.length - 1; i >= 0; i--) {
        const tier = ELO_TIERS[i];
        if (tier && elo >= tier.min) return tier;
    }
    return ELO_TIERS[0]!;
}
