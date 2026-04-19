import { MatchActionRepository } from '../repositories/MatchActionRepository';
import { AnalysisQueueRepository } from '../repositories/AnalysisQueueRepository';
import { GameSession } from '../game_model/GameManager';
import { PlayerRole } from '../types/game.enums';
import { GameState } from '../types/game.interfaces';
import { AnalysisStatus, QueuePriority } from '../types/analysis.enums';
import { GAME_CONSTANTS as G } from '../constants/game.constants';
type ActionType = typeof G.ACTION_TYPES[keyof typeof G.ACTION_TYPES];

export const ActionManager = {

    recordAction(session: GameSession, stateBefore: GameState, playerRole: PlayerRole, type: ActionType, data: any, shouldAnalyze: boolean) {
        if (!session.dbMatchId) return;

        // push the action
        session.actionHistory.push({
            match_id: session.dbMatchId,
            turn_number: stateBefore.turnCount + 1,
            player_id: session.userIds[playerRole],
            action_type: type,
            action_data: data
        });


        // if action should be analyzed and this is not skip turn
        if (shouldAnalyze && (type == G.ACTION_TYPES.MOVE || type == G.ACTION_TYPES.WALL)) {
            // get the action data
            const roleStr = playerRole === PlayerRole.P1 ? PlayerRole.P1 : PlayerRole.P2;
            const actionTuple = type === G.ACTION_TYPES.MOVE
                ? [G.ACTION_TYPES.MOVE, roleStr, [data.r, data.c]]
                : [G.ACTION_TYPES.WALL, roleStr, [data.r, data.c], data.orient];

            // push the action
            session.analysisBuffer.push({
                match_id: session.dbMatchId,
                action_data: actionTuple,
                state_before: stateBefore,
                status: AnalysisStatus.PENDING,
                priority: QueuePriority.DEFAULT
            });
        }

        // if we got to the treshold of actions, uplaod them!
        if (session.actionHistory.length >= G.ACTION_THRESHOLD) {
            this.uploadActions(session);
        }
    },

    async uploadActions(session: GameSession): Promise<void> {
        // check that there are actions to upload
        if (!session.dbMatchId || session.actionHistory.length === 0) return;

        // get the arrays and empty them so the game wont wait for the DB
        const actionsToSave = [...session.actionHistory];
        const analysisToQueue = [...session.analysisBuffer];
        session.actionHistory = [];
        session.analysisBuffer = [];

        try {
            // upload the actions
            const uploadedActions = await MatchActionRepository.insertActions(actionsToSave);
            if (!uploadedActions || uploadedActions.length === 0) return;

            for (const job of analysisToQueue) {
                // find the action id
                const actionRow = uploadedActions.find(
                    (action) => action.turn_number === job.state_before.turnCount + 1
                );

                // inject the action id
                if (actionRow) {
                    job.action_id = actionRow.id;
                }
            }

            const readyQueueJobs = analysisToQueue.filter((job) => job.action_id);

            // insert all for the analysis queue
            if (readyQueueJobs.length > 0) {
                await AnalysisQueueRepository.insertBatchJobs(readyQueueJobs);
            }

        } catch (error) {
            session.actionHistory.unshift(...actionsToSave);
            session.analysisBuffer.unshift(...analysisToQueue);
        }

    }
}