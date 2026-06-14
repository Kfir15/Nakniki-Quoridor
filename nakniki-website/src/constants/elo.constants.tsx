import { Baby, User, GraduationCap, Crown } from 'lucide-react';
import { GiHotDog } from 'react-icons/gi';
import type { ElementType } from 'react';

// A tiny emoji-based icon so the top tier gets a hotdog with NO extra dependency.
// Want a crisp, tintable line-icon instead? `npm i react-icons`, then replace
// `Icon: HotDog` below with `Icon: GiHotDog` and import it:
//     import { GiHotDog } from 'react-icons/gi';
function HotDog({ size = 16 }: { size?: number }) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>🌭</span>;
}

export interface EloTier {
    min: number;       // lowest ELO that belongs to this tier
    label: string;
    color: string;
    Icon: ElementType; // any renderable icon component (lucide / emoji wrapper / react-icons)
}

// ordered low -> high. `min` is the inclusive floor of each band.
export const ELO_TIERS: EloTier[] = [
    { min: 0,    label: 'Baby',           color: '#ec4899', Icon: Baby },            // pink
    { min: 801,  label: 'Intermediate',   color: '#65d16b', Icon: User },            // gray
    { min: 1201, label: 'Expert',         color: '#3b82f6', Icon: GraduationCap },   // blue
    { min: 1601, label: 'Nakniki-Master', color: '#fbbf24', Icon: Crown },           // yellow
    { min: 2001, label: 'Nakniki-God',    color: '#f97316', Icon: GiHotDog },        // orange
];

// return the tier an ELO value falls into (the highest tier whose `min` it reaches)
export function getEloTier(elo: number): EloTier {
    // walk from the top tier down; return the first band we qualify for
    for (let i = ELO_TIERS.length - 1; i >= 0; i--) {
        const tier = ELO_TIERS[i];
        if (tier && elo >= tier.min) return tier;
    }
    return ELO_TIERS[0]!;   // fallback (elo below 0 shouldn't happen, but TS wants a guaranteed return)
}
