export const UI_CONSTANTS = {
    TIMERS: {
        DEFAULT_MATCH_SECONDS: 300,
    },

    LAYOUT: {
        BOARD_PHYSICAL_WIDTH: 750,
        BOARD_PHYSICAL_HEIGHT: 850,
        SIDE_PANEL_CSS: 'clamp(240px, 22vw, 320px)',
        TOP_BAR_RESERVED: 40,
    },

    COLORS: {
        P1: {
            BASE: 'rgba(139, 0, 0, 1.0)',        
            GLOW: 'rgba(230, 45, 45, 0.4)',      
            SOLID: '#ef4444',                   
            BG_LIGHT: 'rgba(239, 68, 68, 0.1)', 
        },
        P2: {
            BASE: 'rgba(218, 165, 32, 1.0)',     
            GLOW: 'rgba(225, 213, 45, 0.4)',    
            SOLID: '#FBBF24',                   
            BG_LIGHT: 'rgba(251, 191, 36, 0.1)', 
        },
        WALL: {
            BASE: 'rgba(128, 0, 0, 1.0)',      
        },
        PROFILE: {
            BG: {
                WIN: 'rgba(34,197,94,0.15)',
                LOSE: 'rgba(239,68,68,0.15)',
            },
            WIN: '#22c55e',
            LOSE: '#ef4444',
            DRAW: '#9ca3af',
        }
    },

    DEFAULTS: {
        PLAYER: {
            ELO: 1200,
            WINS: 0,
            NAME_P1: "Player 1",
            NAME_P2: "Player 2",
            NAME_OPPONENT: "Opponent",
            NAME_WAITING: "Waiting..."
        },
        BOT: {
            NAME: "NAKNIKI BOT",
            ELO: 9999,
            WINS: 9999,
            AVATAR: "/bot-avatar.png"
        }
    },

    DIMENSIONS: {
        BOARD_PADDING: '36px',
        CELL_SIZE: '60px',
        GAP_SIZE: '10px',       
        WALL_LENGTH: '130px',   
        PAWN_SIZE: '65%'     
    },

    END_REASON: {
        TIMEOUT: 'TIMEOUT',
        PATH_REACHED: 'PATH_REACHED',
        OPPONENT_LEFT: 'OPPONENT_LEFT'
    },

    TIMINGS: {
        INTRO_PHASE_1: 1000,    // Time before "BEGIN" shows
        INTRO_PHASE_2: 2500,    // Time before doors start opening
        INTRO_PHASE_3: 3800     // Time when the intro is completely finished
    },
} as const;