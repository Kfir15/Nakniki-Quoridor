import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Spinner, Text, Button } from '@radix-ui/themes';
import { GameStatus, PlayerRole } from '@nakniki/shared';
import { useGameSession } from '../../hooks/useGameSession';
import { useUser } from '../../services/UserContext';
import { ROUTES as R } from '../../constants/routes.constants';
import GameSideBar from '../../components/game/GameSideBar';
import GameBoard from '../../components/game/GameBoard';
import WallCounter from '../../components/game/WallCounter';
import { GameOverModal } from '../../components/game/GameOverModal';
import FloatingError from '../../components/error/FloatingError';
import BackButton from '../../components/BackButton';
import type { SidebarPlayerData } from '../../components/game/PlayerCard';
import GameIntroOverlay from '../../components/game/GameIntroOverlay';
import { useState } from 'react';

export default function GamePage() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    // get the game params
    const initialState = location.state?.initialState;
    const isHost = location.state?.isHost ?? true;
    const isAiGame = location.state?.isAiGame ?? false;
    const myRole = isHost ? PlayerRole.P1 : PlayerRole.P2;
    const opponentRole = isHost ? PlayerRole.P2 : PlayerRole.P1;
    const [isIntroPlaying, setIsIntroPlaying] = useState(!isAiGame);

    // use the custom hooks
    const { gameState, movePawn, placeWall, error, clearError, abandonGame, opponentAbandoned, playersInfo } = useGameSession(
        initialState,
        gameId!,
        isAiGame
    );

    // handle leaving the game
    const handleLeaveGame = () => {
        if (gameState && gameState.status === GameStatus.IN_PROGRESS) {
            // active abordon game logic and nav to home
            abandonGame();
        }
        navigate(R.HOME);
    };

    // if we have problem, show error and nav options
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

    // while loading the game state, show a spinner
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

    // get the players info
    const metadata = user?.user_metadata;
    const p1Data: SidebarPlayerData = {
        username: playersInfo?.p1?.username || (isHost ? (metadata?.username || "Player 1") : "Opponent"),
        avatar_url: playersInfo?.p1?.avatar_url || (isHost ? metadata?.avatar_url : undefined),
        elo_rating: playersInfo?.p1?.elo_rating || (isHost ? (Number(metadata?.elo_rating) || 1200) : 1200),
        total_wins: playersInfo?.p1?.total_wins || (isHost ? (Number(metadata?.total_wins) || 0) : 0),
        isAi: false
    };
    const p2Data: SidebarPlayerData = {
        username: isAiGame ? "NAKNIKI BOT" : (playersInfo?.p2?.username || (!isHost ? (metadata?.username || "Player 2") : "Waiting...")),
        avatar_url: playersInfo?.p2?.avatar_url || (!isHost ? metadata?.avatar_url : undefined),
        elo_rating: isAiGame ? 9999 : (playersInfo?.p2?.elo_rating || (!isHost ? (Number(metadata?.elo_rating) || 1200) : 1200)),
        total_wins: isAiGame ? 9999 : (playersInfo?.p2?.total_wins || (!isHost ? (Number(metadata?.total_wins) || 0) : 0)),
        isAi: isAiGame
    };

    const isFinished = gameState.status === GameStatus.FINISHED || opponentAbandoned;
    const actualWinner = opponentAbandoned ? myRole : gameState.winner;
    const actualReason = opponentAbandoned ? "OPPONENT_LEFT" : (gameState.winner ? "PATH_REACHED" : "TIMEOUT");

    // wall count for each player
    const isMyTurnP1 = myRole === PlayerRole.P1;
    const myWallsCount = isMyTurnP1 ? gameState.player1.wallsLeft : gameState.player2.wallsLeft;
    const opponentWallsCount = isMyTurnP1 ? gameState.player2.wallsLeft : gameState.player1.wallsLeft;

    return (
        <Box style={{ position: 'relative', height: '100vh', backgroundColor: '#050505', overflow: 'hidden' }}>

            {!isAiGame && isIntroPlaying && (
                <GameIntroOverlay onComplete={() => setIsIntroPlaying(false)} />
            )}

            {/* go back btn (abondan the game) */}
            <Box style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 200 }}>
                <BackButton onClick={handleLeaveGame} />
            </Box>

            {/* show side bar */}
            <GameSideBar 
                state={gameState} 
                myRole={myRole} 
                p1Data={p1Data} 
                p2Data={p2Data} 
                initialTimeSeconds={300} 
                isTimerActive={isAiGame ? true : !isIntroPlaying} 
            />

            <Flex direction="column" gap="6" align="center" justify="center" style={{ width: '100%', height: '100%' }}>
                
                {/* opponent wall counter */}
                <WallCounter count={opponentWallsCount} role={opponentRole} />
                
                {/* show game board */}
                <GameBoard gameState={gameState} myRole={myRole} movePawn={movePawn} placeWall={placeWall} />
                
                {/* my wall counter */}
                <WallCounter count={myWallsCount} role={myRole} />

            </Flex>

            {/* end game screen */}
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