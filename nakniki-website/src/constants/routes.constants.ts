export const ROUTES = {
    HOME: '/',
    LEADERBOARD: '/leaderboard',
    HOW_TO_PLAY: '/how-to-play',
    LOGIN: '/login',
    SIGNUP: '/signup',
    PROFILE: (username: string) => `/profile/${username}`,
    PROFILE_BASE: '/profile/:username'
} as const;