export const SOCKET_EVENTS = {
    // events sent from client to server
    CLIENT: {
        AI_START: 'start_ai_game',
        AI_MOVE_PAWN: 'ai_move_pawn',
        AI_PLACE_WALL: 'ai_place_wall',
        ABANDON_GAME: 'abandon_game',
    },
    // events sent from server to client
    SERVER: {
        GAME_STARTED: 'game_started',
        STATE_UPDATE: 'state_update',
        INVALID_MOVE: 'invalid_move',
        GAME_ABANDONED: 'game_abandoned',
        ERROR: 'game_error',
    },
    // built in socket io events
    CORE: {
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
    }
} as const;