import os
import sys
import asyncio
from typing import Dict, Any, Optional
from supabase import create_async_client, AsyncClient
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ai.game_model_utils import parse_state
from common.analysis_worker_constants import WorkerConstants
from analysis import get_analysis

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


class AnalysisWorker:
    def __init__(self):
        # get the supabase url and key
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.url or not self.key:
            raise ValueError("Missing Supabase credentials in .env file.")

        # create the client
        self.supabase: Optional[AsyncClient] = None
        self.is_processing = False

    async def start(self) -> None:
        self.supabase = await create_async_client(self.url, self.key)

        # listen to supabase if new action the analysis entered
        channel = self.supabase.channel(WorkerConstants.CHANNEL_NAME)
        channel.on_postgres_changes(
            event=WorkerConstants.EVENT_TYPE,
            schema=WorkerConstants.SCHEMA,
            table=WorkerConstants.QUEUE_TABLE,
            callback=self._handle_realtime_event,
        )
        await channel.subscribe()

        # on startup, check if there are actions
        await self._process_queue()

        # keep the event loop running
        while True:
            await asyncio.sleep(3600)

    def _handle_realtime_event(self, payload: Dict[str, Any]) -> None:
        asyncio.create_task(self._process_queue())

    async def _process_queue(self) -> None:
        if self.is_processing:
            return
        self.is_processing = True

        try:
            while True:
                # get the next action
                response = await (
                    self.supabase.table(WorkerConstants.QUEUE_TABLE)
                    .select("*")
                    .eq("status", WorkerConstants.STATUS_PENDING)
                    .order("priority")
                    .order("created_at")
                    .limit(1)
                    .execute()
                )
                job = response.data

                # if no jobfound, break
                if not job:
                    break

                # get the job info
                target_job = job[0]
                queue_id = target_job["id"]
                action_id = target_job["action_id"]

                # mark the job as in process
                if not await self._mark_process(queue_id):
                    continue

                # process the job
                await self._process_job(target_job, queue_id, action_id)

        finally:
            self.is_processing = False

    async def _process_job(
        self, target_job: Dict[str, Any], queue_id: str, action_id: str
    ) -> None:
        try:
            # parse the action
            action_played = self._parse_action_tuple(target_job.get("action_data"))

            # get the game state
            raw_state = target_job.get("state_before")
            if "state" in raw_state:
                raw_state = raw_state["state"]
            parsed_state = parse_state(raw_state)

            # run the analysis
            analysis_result = await asyncio.to_thread(
                get_analysis, parsed_state, action_played
            )

            # save result and remove from queue
            await self._save_results(action_id, analysis_result)
            await self._remove_from_queue(queue_id)

        except Exception as _:
            # if error, mark as failed
            await self._mark_job_failed(queue_id)

    async def _mark_process(self, queue_id: str) -> bool:

        # update the job to be process after pending
        res = await (
            self.supabase.table(WorkerConstants.QUEUE_TABLE)
            .update({"status": WorkerConstants.STATUS_PROCESSING})
            .eq("id", queue_id)
            .eq("status", WorkerConstants.STATUS_PENDING)
            .execute()
        )
        return bool(res.data)

    def _parse_action_tuple(self, raw_action: list) -> tuple:

        # converts the array in JSON to tuple
        if not raw_action:
            raise ValueError("Action data is empty.")

        if raw_action[0] == "move":
            return (raw_action[0], raw_action[1], tuple(raw_action[2]))

        return (raw_action[0], raw_action[1], tuple(raw_action[2]), raw_action[3])

    async def _save_results(
        self, match_action_id: str, analysis_result: Dict[str, Any]
    ) -> None:

        # update the action table with the analysis
        await (
            self.supabase.table(WorkerConstants.ACTIONS_TABLE)
            .update(
                {
                    "analysis": {
                        "evaluation": analysis_result["evaluation"],
                        "score_drop": analysis_result["scoreDrop"],
                        "accuracy": analysis_result["accuracy"],
                        "best_action": analysis_result["bestAction"],
                    }
                }
            )
            .eq("id", match_action_id)
            .execute()
        )

    async def _remove_from_queue(self, queue_id: str) -> None:

        # delete the job from the queue after the analysis
        await (
            self.supabase.table(WorkerConstants.QUEUE_TABLE)
            .delete()
            .eq("id", queue_id)
            .execute()
        )

    async def _mark_job_failed(self, queue_id: str) -> None:

        # marks a job as failed
        await (
            self.supabase.table(WorkerConstants.QUEUE_TABLE)
            .update({"status": WorkerConstants.STATUS_FAILED})
            .eq("id", queue_id)
            .execute()
        )


if __name__ == "__main__":
    worker = AnalysisWorker()
    try:
        asyncio.run(worker.start())
    except KeyboardInterrupt:
        print("Worker shut down.")
