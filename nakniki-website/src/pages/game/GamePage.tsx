import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Spinner, Text, Button } from '@radix-ui/themes';
import { GameStatus, PlayerRole } from '@nakniki/shared';

import { useGameSession } from '../../hooks/useGameSession';
import { useUser } from '../../services/UserContext';
import { ROUTES as R } from '../../constants/routes.constants';

import GameSideBar from '../../components/game/GameSideBar';
import GameBoard from '../../components/game/GameBoard';
import { GameOverModal } from '../../components/game/GameOverModal';
import FloatingError from '../../components/error/FloatingError';
import BackButton from '../../components/BackButton';
import type { SidebarPlayerData } from '../../components/game/PlayerCard';

export default function GamePage() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    // 1. Extract context params safely passed from Router navigation states
    const initialState = location.state?.initialState;
    const isHost = location.state?.isHost ?? true;
    const isAiGame = location.state?.isAiGame ?? false;

    // Resolve structural target roles cleanly
    const myRole = isHost ? PlayerRole.P1 : PlayerRole.P2;

    // 2. Local Terminal Move Logging State

    // 3. Connect safely to your live hook component with exact configuration bounds
    const { gameState, movePawn, placeWall, error, clearError, abandonGame, opponentAbandoned } = useGameSession(
        initialState,
        gameId!,
        isAiGame
    );

    const handleLeaveGame = () => {
        if (gameState && gameState.status === GameStatus.IN_PROGRESS) {
            abandonGame();
        }
        navigate(R.HOME);
    };

    // 5. Hard Safeguard Boundary Check
    if (!initialState || !gameId) {
        return (
            <Flex align="center" justify="center" direction="column" gap="4" style={{ height: '100vh', backgroundColor: '#050505' }}>
                <Text color="red" weight="bold" size="5" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                    CRITICAL LINK FAILURE
                </Text>
                <Text color="gray" size="2">No active game coordinates or matching session targets found.</Text>
                <Button onClick={() => navigate(R.HOME)} size="3" variant="soft" color="red" style={{ cursor: 'pointer' }}>
                    Return to Hub
                </Button>
            </Flex>
        );
    }

    // 6. Loading handshake rendering guard check
    if (!gameState) {
        return (
            <Flex align="center" justify="center" style={{ height: '100vh', backgroundColor: '#050505' }}>
                <Spinner size="3" style={{ color: '#ef4444' }} />
                <Text ml="3" color="gray" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                    INITIALIZING MATCH ENGINE GATEWAYS...
                </Text>
            </Flex>
        );
    }

    // 7. Synchronous Profile Resolution — Perfectly maps UserContext without slow API calls
    // 6. Map Static Profiles cleanly by safely extracting metrics from user_metadata
    const metadata = user?.user_metadata;

    const p1Data: SidebarPlayerData = {
        username: isHost ? (metadata?.username || "Player 1") : "Opponent",
        avatar_url: isHost ? metadata?.avatar_url : undefined,
        elo_rating: isHost ? (Number(metadata?.elo_rating) || 1200) : 1200,
        total_wins: isHost ? (Number(metadata?.total_wins) || 0) : 0,
        isAi: false
    };

    const p2Data: SidebarPlayerData = {
        username: isAiGame ? "NAKNIKI BOT" : (!isHost ? (metadata?.username || "Player 2") : "Opponent"),
        avatar_url: !isHost ? metadata?.avatar_url : undefined,
        elo_rating: isAiGame ? 9999 : (!isHost ? (Number(metadata?.elo_rating) || 1200) : 1200),
        total_wins: isAiGame ? 9999 : (!isHost ? (Number(metadata?.total_wins) || 0) : 0),
        isAi: isAiGame
    };

    const isFinished = gameState.status === GameStatus.FINISHED || opponentAbandoned;
    const actualWinner = opponentAbandoned ? myRole : gameState.winner;
    const actualReason = opponentAbandoned ? "OPPONENT_LEFT" : (gameState.winner ? "PATH_REACHED" : "TIMEOUT");

    return (
        <Box style={{ position: 'relative', height: '100vh', backgroundColor: '#050505', overflow: 'hidden' }}>
            
            {/* The Escape Hatch now securely abandons the game! */}
            <Box style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 200 }}>
                <BackButton onClick={handleLeaveGame} />
            </Box>

            <GameSideBar state={gameState} myRole={myRole} p1Data={p1Data} p2Data={p2Data} initialTimeSeconds={300} />

            <Flex align="center" justify="center" style={{ width: '100%', height: '100%' }}>
                <GameBoard gameState={gameState} myRole={myRole} movePawn={movePawn} placeWall={placeWall} />
            </Flex>

            {/* The End Game Modal will automatically pop up with "You Won" if the opponent leaves! */}
            {/* The End Game Modal */}
            <GameOverModal 
                isOpen={isFinished}
                winner={actualWinner}
                myRole={myRole}
                reason={actualReason}
                onReturnHome={() => navigate(R.HOME)} 
            />

            <FloatingError message={error || ''} onClose={clearError} />
        </Box>
    );
}