import { GAME_CONSTANTS as G } from '@nakniki/shared'

export enum Accuracy {   
    BEST = "Best Move",
    EXCELLENT = "Excellent",
    GOOD = "Good",
    INACCURACY = "Inaccuracy",
    MISTAKE = "Mistake",
    BLUNDER = "Blunder",
}

export const ACCURACY_COLORS: Record<Accuracy, string> = {
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
    action_type: typeof G.ACTION_TYPES;
    action_data: any;
    analysis: MoveAnalysis | null;
}
export interface MatchInfo {
    id: string;
    status: string;
    winner_id: string | null;
    player_1: { username: string; avatar_url: string | null } | null;
    player_2: { username: string; avatar_url: string | null } | null;
}