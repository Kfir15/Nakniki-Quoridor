export const AI_CONSTANTS = {
    PROXY_BASE_URL: process.env.AI_PROXY_URL || 'http://localhost:5000',
    ENDPOINTS: {
        GET_MOVE: '/ai_get_action',
    },
    TIMEOUT_MS: 15000
} as const;