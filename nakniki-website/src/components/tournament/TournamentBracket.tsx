// Need - Single match bracket: username, pfp, match status, winner
import { TournamentMatchStatus } from "@nakniki/shared";


export interface BracketProps {
    p1Name: string | null;
    p2Name: string | null;
    p1Avatar: string | null;
    p2Avatar: string | null;
    status: TournamentMatchStatus; 
    winner: 'p1' | 'p2' | null;
}

export function TournamentBracket({ p1Name, p2Name, p1Avatar, p2Avatar, status, winner }: BracketProps) {
    return (null);
}