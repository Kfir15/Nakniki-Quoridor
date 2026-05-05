export const SOCKET_EVENTS = {
    // events sent from client to server
    CLIENT: {
        AI_START: 'start_ai_game',
        AI_MOVE_PAWN: 'ai_move_pawn',
        AI_PLACE_WALL: 'ai_place_wall',
        ABANDON_GAME: 'abandon_game',
        AI_GAME_TIMEOUT: 'ai_turn_timeout',
        CREATE_LOBBY: 'create_lobby',
        JOIN_LOBBY: 'join_lobby',
        GET_PUBLIC_LOBBIES: 'get_public_lobbies',
        MP_MOVE_PAWN: 'mp_move_pawn',
        MP_PLACE_WALL: 'mp_place_wall',
        MP_GAME_TIMEOUT: 'mp_game_timeout',
        MP_ABANDON_GAME: 'mp_abandon_game',
    },
    // events sent from server to client
    SERVER: {
        GAME_STARTED: 'game_started',
        STATE_UPDATE: 'state_update',
        INVALID_MOVE: 'invalid_move',
        GAME_ABANDONED: 'game_abandoned',
        ERROR: 'game_error',
        LOBBY_CREATED: 'lobby_created',
        LOBBY_JOINED: 'lobby_joined',
        OPPONENT_JOINED: 'opponent_joined',
        LOBBY_ERROR: 'lobby_error',
        PUBLIC_LOBBIES_LIST: 'public_lobbies_list',
    },
    // built in socket io events
    CORE: {
        CONNECTION: 'connect',
        DISCONNECT: 'disconnect',
        CONNECTION_ERROR: 'connect_error',
    }
} as const;