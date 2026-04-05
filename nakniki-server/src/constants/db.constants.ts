export const DB_CONSTANTS = {
    TABLES: {
        USERS: 'users',
        MATCHES: 'matches',
        MATCH_ACTIONS: 'match_actions',
    },
    ERROR_CODES: {
        UNIQUE_VIOLATION: '23505',
    },
    LIMITS: {
        SEARCH_USERS: 15,
    }
} as const;