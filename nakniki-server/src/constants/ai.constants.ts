export const AI_CONSTANTS = {
    PROXY_BASE_URL: process.env.AI_PROXY_URL || 'http://127.0.0.1:5000',
    ENDPOINTS: {
        GET_MOVE: '/ai_get_action',
    },
    TIMEOUT_MS: 15000
} as const;