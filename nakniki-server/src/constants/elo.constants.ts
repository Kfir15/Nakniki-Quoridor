 export const ELO_CONSTANTS = {
    // Factor for elo calculation. May be adjusted for the quickness of elo changes. Higher factor means quicker.
    ELOFACTOR: 32,
    // Factor for claculating the win probability. Higher factor means sharper probability curve.
    WINPROBABILITYFACTOR: 400,
    DEFAULT_ELO: 1200,
    MIN_ELO : 1
} as const;