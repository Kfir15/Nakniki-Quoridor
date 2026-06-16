export const ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        SIGNUP: '/auth/signup',
    },
    USERS: {
        LEADERBOARD: '/users/leaderboard',
        RANK: '/users/rank',
        PROFILE: '/users/profile',
        SEARCH: (query: string) => `/users/search?q=${query}`,
        H2H_STATS: (userId: string) => `/users/h2h/${userId}`,
    },
    MATCHES: {
        HISTORY: '/matches/history',
    },
    TOURNAMENTS: {
        MINE: '/tournaments/mine',
    },
} as const;