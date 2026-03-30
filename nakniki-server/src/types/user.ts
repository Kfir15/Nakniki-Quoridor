export interface User {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    elo_rating: number;
    games_played: number;
    games_wins: number;
    created_at?: string;
}