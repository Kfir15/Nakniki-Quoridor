export const ROUTES = {
    HOME: '/',
    NOT_FOUND: '/*',
    LEADERBOARD: '/leaderboard',
    HOW_TO_PLAY: '/how-to-play',
    LOGIN: '/login',
    SIGNUP: '/signup',
    PROFILE: (username: string) => `/profile/${username}`,
    PROFILE_BASE: '/profile/:username',
    MP_LOBBY: '/mp-lobby',
    GAME: '/game/:gameId',
    WAITING: '/waiting/:lobbyType/:gameId',
} as const;