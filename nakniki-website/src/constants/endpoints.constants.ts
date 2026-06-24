export const ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        SIGNUP: '/auth/signup',
    },
    USERS: {
        LEADERBOARD: '/users/leaderboard',
        RANK: '/users/rank',
        PROFILE: '/users/profile',
        UPDATE: '/users/update',
        SEARCH: (query: string) => `/users/search?q=${query}`,
        H2H_STATS: (userId: string) => `/users/h2h/${userId}`,
    },
    MATCHES: {
        HISTORY: '/matches/history',
    },
    TOURNAMENTS: {
        LIST: '/tournaments',
        CREATE: '/tournaments',
        MINE: '/tournaments/mine',
        DETAILS: (id: string) => `/tournaments/${id}`,
        JOIN: (id: string) => `/tournaments/${id}/join`,
    },
} as const;