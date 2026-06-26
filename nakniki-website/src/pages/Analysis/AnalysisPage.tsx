import { ENDPOINTS as E } from "../../constants/endpoints.constants";
import { type MoveAnalysis, type MatchAction, type MatchInfo, Accuracy } from "../../constants/analysis.constants";
import { sendGet } from "../../services/api";
import { BoardManager, Position, PlayerRole, GameStatus, type GameState, GAME_CONSTANTS as G } from "@nakniki/shared";
import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../services/UserContext";
import LoadingSpinner from '../../components/LoadingSpinner';
import { Text } from "lucide-react";
import { buildStates } from "../../utils/analysisHelpers";


export function AnalysisPage() {
    const { gameId } = useParams<{ gameId: string }>();  
    const { user } = useUser();

    const [match, setMatch] = useState<MatchInfo | null>(null);
    const [actions, setActions] = useState<MatchAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
                try {
                    // Get match data from the server
                    const res = await sendGet<{ match: MatchInfo; actions: MatchAction[] }>(E.MATCHES.ANALYSIS(gameId!), user?.token);
                    setMatch(res.data.match);
                    setActions(res.data.actions);
                }
                catch (e: any) {
                    setError(e?.response?.data?.error ?? 'Failed to load analysis.');
                } finally {
                    setIsLoading(false);
                }
            }; 
            if (gameId) fetchAnalysis();
        }, [gameId, user?.token]);
        // We use useMemo to cache premade calculations of the state, instead of rebuilding it over and over
        const states = useMemo(() => buildStates(actions), [actions]);

        if (isLoading) return <LoadingSpinner></LoadingSpinner>;
        if (error || !match) return <Text color="red">{error ?? "Couldn't load analysis."}</Text>;
        return (null);
    }

// Need: get the match actions for the match, save them as a state
// Make an eval bar
// save action history, back, forward, start phase, end phase buttons
// Reuse the game board from the play page