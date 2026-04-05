export const ROUTE_CONSTANTS = {
    BASE: '/api',
    AUTH: {
        ROOT: '/auth',
        SIGNUP: '/signup',
        SIGNIN: '/signin',
    },
    USERS: {
        ROOT: '/users',
        PROFILE: '/profile',
        LEADERBOARD: '/leaderboard',
        SEARCH: '/search',
        UPDATE: '/update',
    },
    MATCHES: {
        ROOT: '/matches',
        HISTORY: '/history',
    }
} as const;