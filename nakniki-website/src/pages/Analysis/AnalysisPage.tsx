import { ENDPOINTS as E } from "../../constants/endpoints.constants";
import { type MoveAnalysis, type MatchAction, type MatchInfo, Accuracy } from "../../constants/analysis.constants";
import { sendGet } from "../../services/api";
import { BoardManager, Position, PlayerRole, GameStatus, type GameState, GAME_CONSTANTS as G } from "@nakniki/shared";
import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../services/UserContext";
import LoadingSpinner from '../../components/LoadingSpinner';
import { buildStates } from "../../utils/analysisHelpers";
import { Flex, Button, Text } from "@radix-ui/themes";
import GameBoard from "../../components/game/GameBoard";
import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { LayoutGroup } from 'framer-motion';


export function AnalysisPage() {
    const { gameId } = useParams<{ gameId: string }>();  
    const { user } = useUser();

    const [match, setMatch] = useState<MatchInfo | null>(null);
    const [actions, setActions] = useState<MatchAction[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
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

        const steps = useMemo(() =>
            states.map((state, i) => ({
                state,
                action: i > 0 ? actions[i - 1] : null,
                analysis: i > 0 ? actions[i - 1].analysis : null,
            })),
            [states, actions]
        );

        const last = states.length - 1;
        const go = (i: number) => setCurrentIndex(Math.max(0, Math.min(last, i)));

        if (isLoading) return <LoadingSpinner></LoadingSpinner>;
        if (error || !match) return <Text color="red">{error ?? "Couldn't load analysis."}</Text>;
        return (

            <Flex direction="column" align="center" gap="4" style={{ padding: 24 }}>
                {/* The board itself */ }
                <GameBoard
                    gameState={states[currentIndex]}
                    myRole={PlayerRole.P1}         // fixed orientation for the replay
                    movePawn={() => {}}            // Can't move pawns on our own on a replay
                    placeWall={() => {}}           // Can't place walls on our own on a replay
                    readOnly
                />

                { /* Control Panel of the moves */ }
                <Flex align="center" gap="2">
                    <Button onClick={() => go(0)} disabled={currentIndex === 0}>
                        <DoubleArrowLeftIcon></DoubleArrowLeftIcon>
                    </Button>
                    <Button onClick={() => go(currentIndex-1)} disabled={currentIndex === 0}>
                        <ArrowLeftIcon></ArrowLeftIcon>
                    </Button>
                    <Text size="3" color="gray" style={{ minWidth: 70, textAlign: 'center' }}>
                        {currentIndex} / {last}
                    </Text>
                    <Button onClick={() => go(currentIndex+1)} disabled={currentIndex === last}>
                        <ArrowRightIcon></ArrowRightIcon>
                    </Button>
                    <Button onClick={() => go(last)} disabled={currentIndex === last}>
                        <DoubleArrowRightIcon></DoubleArrowRightIcon>
                    </Button>
                </Flex>
            </Flex>
        );
    }

// Need: get the match actions for the match, save them as a state
// Make an eval bar
// save action history, back, forward, start phase, end phase buttons
// Reuse the game board from the play page