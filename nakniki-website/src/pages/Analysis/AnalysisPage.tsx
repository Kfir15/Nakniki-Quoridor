import { ENDPOINTS as E } from "../../constants/endpoints.constants";
import { type MatchAction, type MatchInfo, ACCURACY_COLORS } from "../../constants/analysis.constants";
import { sendGet } from "../../services/api";
import { PlayerRole } from "@nakniki/shared";
import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../services/UserContext";
import LoadingSpinner from '../../components/LoadingSpinner';
import { buildStates, formatAction, buildBestMove } from "../../utils/analysisHelpers";
import { Flex, Button, Text, Box, Badge } from "@radix-ui/themes";
import GameBoard from "../../components/game/GameBoard";
import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { MoveList } from "../../components/analysis/MoveList";
import { EvalBar } from "../../components/analysis/EvalBar";
import BestMoveOverlay from "../../components/analysis/BestMoveOverlay";



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

        const analysis  = steps[currentIndex].analysis;
        const moveWasP1 = (currentIndex - 1) % 2 === 0;
        let p1Eval    = analysis ? (moveWasP1 ? analysis.evaluation : -analysis.evaluation) : null;

        // Shows the best move
        const bestMove = useMemo(
        () => buildBestMove(steps[currentIndex].analysis, states[currentIndex - 1], currentIndex),
        [steps, states, currentIndex],
        );

        if (isLoading) return <LoadingSpinner></LoadingSpinner>;
        if (error || !match) return <Text color="red">{error ?? "Couldn't load analysis."}</Text>;
        return (
            <Flex align="center" style={{ width: '100%', height: 'calc(100vh - 150px)', minHeight: 0, padding: '0 40px' }}>

                {/* EVAL BAR */}
                <Box style={{ width: '15%', height: '75%', paddingLeft:'10px', display: 'flex', flexDirection: 'column', gap: 16 }} >
                    <Box style={{ flex: 1, minHeight: 0 }}>
                        <EvalBar evaluation={p1Eval}></EvalBar>
                    </Box>
                    
                    {analysis && (
                        <Flex direction="column" gap="2" style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(15,15,15)' }}>
                            <Badge color={ACCURACY_COLORS[analysis.accuracy]} variant="soft" radius="full">
                                {analysis.accuracy}
                            </Badge>
                            <Text size="2" color="gray">Best: {formatAction(analysis.best_action)}</Text>
                        </Flex>
                    )}
                </Box>

                <Flex direction="column" align="center" gap="4" style={{ flex: 1 }}>
                    {/* The board itself */ }
                    <Box style={{ position: 'relative', display: 'inline-block' }}>
                        <GameBoard
                            gameState={states[currentIndex]}
                            myRole={PlayerRole.P1}
                            movePawn={() => {}}
                            placeWall={() => {}}
                            readOnly
                        />
                        {bestMove && <BestMoveOverlay hint={bestMove} boardSize={states[currentIndex].size} />}
                    </Box>
                    

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

                <Box style={{ width: '15%', height: '75%', minHeight: 0, overflowY: 'auto', zIndex: 50 }}>
                        <MoveList 
                            actions={actions}
                            currentIndex={currentIndex}
                            onSelect={setCurrentIndex}
                        />
                </Box>
        </Flex>
    );
}
