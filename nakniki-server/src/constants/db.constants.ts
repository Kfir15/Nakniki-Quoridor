export const DB_CONSTANTS = {
    TABLES: {
        USERS: 'users',
    },
    ERROR_CODES: {
        UNIQUE_VIOLATION: '23505',
    },
    LIMITS: {
        SEARCH_USERS: 15,
    }
} as const;