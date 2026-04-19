export enum AnalysisStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    FAILED = 'FAILED'
}

export enum MoveAccuracy {
    BEST = 'Best Move',
    EXCELLENT = 'Excellent',
    GOOD = 'Good',
    INACCURACY = 'Inaccuracy',
    MISTAKE = 'Mistake',
    BLUNDER = 'Blunder'
}

// lower number -> higher priority
export enum QueuePriority {
    DEFAULT = 10,
    ERGENT = 1,
}