export interface User {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    elo_rating: number;
    total_games: number;
    total_wins: number;
    created_at?: string;
}