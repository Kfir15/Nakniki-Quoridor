class WorkerConstants:
    QUEUE_TABLE = "analysis_queue"
    ACTIONS_TABLE = "match_actions"
    STATUS_PENDING = "PENDING"
    STATUS_PROCESSING = "PROCESSING"
    STATUS_FAILED = "FAILED"
    CHANNEL_NAME = "worker_queue"
    SCHEMA = "public"
    EVENT_TYPE = "INSERT"
