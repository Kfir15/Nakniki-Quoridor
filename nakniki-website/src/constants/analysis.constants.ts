import { Badge } from '@radix-ui/themes';
import type { ComponentProps } from 'react';

type AccentColor = ComponentProps<typeof Badge>['color'];

export enum Accuracy {   
    BEST = "Best Move",
    EXCELLENT = "Excellent",
    GOOD = "Good",
    INACCURACY = "Inaccuracy",
    MISTAKE = "Mistake",
    BLUNDER = "Blunder",
}

export const ACCURACY_COLORS: Record<Accuracy, AccentColor> = {
    [Accuracy.BEST]: 'green',
    [Accuracy.EXCELLENT]: 'teal',
    [Accuracy.GOOD]: 'blue',
    [Accuracy.INACCURACY]: 'yellow',
    [Accuracy.MISTAKE]: 'orange',
    [Accuracy.BLUNDER]: 'red',
};

export interface MoveAnalysis {
    evaluation: number;
    score_drop: number;
    accuracy: Accuracy;
    best_action: any[];
}
export interface MatchAction {
    id: string;
    turn_number: number;
    player_id: string;
    action_type: string;
    action_data: any;
    analysis: MoveAnalysis | null;
}
export interface MatchInfo {
    id: string;
    status: string;
    winner_id: string | null;
    is_ai_match: boolean;
    player_1_id: string;
    player_2_id: string | null;
    player_1: { username: string; avatar_url: string | null } | null;
    player_2: { username: string; avatar_url: string | null } | null;
}