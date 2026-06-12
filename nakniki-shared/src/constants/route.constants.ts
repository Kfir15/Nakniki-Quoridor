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
        H2H: '/h2h/:id',
        RANK: '/rank',
    },
    MATCHES: {
        ROOT: '/matches',
        HISTORY: '/history',
        DETAILS: '/:id',
    },
    TOURNAMENTS: {
        ROOT: '/tournaments',
        LIST: '/',
        CREATE: '/',
        DETAILS: '/:id',
        JOIN: '/:id/join',
    }
} as const;