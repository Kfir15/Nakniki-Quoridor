import { GameState } from '@nakniki/shared';
import { AnalysisStatus, MoveAccuracy } from './analysis.enums';

export interface AnalysisQueueItem {
    id?: string;
    action_id: string;
    state_before: GameState;
    action_data: any[];
    status: AnalysisStatus;
    priority: number;
    created_at?: string;
}

export interface AnalysisResult {
    evaluation: number;
    score_drop: number;
    accuracy: MoveAccuracy;
    best_action: any[];
}