export const DB_CONSTANTS = {
    TABLES: {
        USERS: 'users',
        MATCHES: 'matches',
        MATCH_ACTIONS: 'match_actions',
        ANALYSIS_QUEUE: 'analysis_queue',
        TOURNAMENTS: 'tournaments',
        TOURNAMENT_PARTICIPANTS: 'tournament_participants',
        TOURNAMENT_MATCHES: 'tournament_matches',
    },
    ERROR_CODES: {
        UNIQUE_VIOLATION: '23505',
    },
    LIMITS: {
        SEARCH_USERS: 15,
    }
} as const;