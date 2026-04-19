import { supabase } from '../lib/supabase';
import { DB_CONSTANTS as DB } from '../constants/db.constants';
import { GameState } from '../types/game.interfaces';
import { AnalysisStatus, QueuePriority } from '../types/analysis.enums';

export const AnalysisQueueRepository = {
    // insert new job to the queue
    async insertNewJob(matchId: string, actionId: string, action: any[], stateBefore: GameState, priority: number = QueuePriority.DEFAULT) {
        // check we got all
        if (!matchId || !actionId || !action || !stateBefore) return false;

        const { data, error } = await supabase
            .from(DB.TABLES.ANALYSIS_QUEUE)
            .insert({
                match_id: matchId,
                action_id: actionId,
                action_data: action,
                state_before: stateBefore,
                status: AnalysisStatus.PENDING,
                priority: priority
            })

        // check if success
        if (error) throw error;

        return true;
    },

    async insertBatchJobs(jobs: any[]) {
        if (!jobs || jobs.length === 0) return false;

        // insert all the jobs
        const { data, error } = await supabase
            .from(DB.TABLES.ANALYSIS_QUEUE)
            .insert(jobs)

        // check if success
        if (error) throw error;

        return true;
    },

    async changePriority(matchId: string, newPriority: number) {
        if (!matchId || newPriority == null) return false;

        // update the priority
        const { data, error } = await supabase
            .from(DB.TABLES.ANALYSIS_QUEUE)
            .update({ priority: newPriority })
            .eq('match_id', matchId)

        // check if success
        if (error) throw error;

        return true;
    },

    async hasPendingJobs(matchId: string) {
        if (!matchId) return false;

        const { count, error } = await supabase
            .from(DB.TABLES.ANALYSIS_QUEUE)
            .select('*', { count: 'exact', head: true })
            .eq('match_id', matchId)
            .in('status', [AnalysisStatus.PENDING, AnalysisStatus.PROCESSING]);

        // check if success
        if (error) throw error;

        // return true if there is pending jobs
        return (count ?? 0) > 0;
    }
}