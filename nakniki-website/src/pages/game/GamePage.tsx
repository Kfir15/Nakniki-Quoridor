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
import ActionPanel from '../../components/game/ActionPanel';
import { useState, useEffect, useRef } from 'react';
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

export default function GamePage() {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    const initialState = location.state?.initialState;
    const isHost = location.state?.isHost ?? true;
    const isAiGame = location.state?.isAiGame ?? false;
    const myRole = isHost ? PlayerRole.P1 : PlayerRole.P2;
    const opponentRole = isHost ? PlayerRole.P2 : PlayerRole.P1;
    const [isIntroPlaying, setIsIntroPlaying] = useState(false);
    const introHasPlayed = useRef(false);

    const { gameState, movePawn, placeWall, error, clearError, abandonGame, opponentAbandoned, playersInfo } = useGameSession(
        initialState,
        gameId!,
        isAiGame
    );

    // start the intro the moment the game goes live, to make sure the timers are synced
    useEffect(() => {
        if (!isAiGame && gameState?.status === GameStatus.IN_PROGRESS && !introHasPlayed.current) {
            introHasPlayed.current = true;
            setIsIntroPlaying(true);
        }
    }, [gameState?.status, isAiGame]);

    const handleLeaveGame = () => {
        if (gameState && gameState.status === GameStatus.IN_PROGRESS) {
            abandonGame();
        }
        navigate(R.HOME);
    };

    // dynamic window scayling
    const [boardScale, setBoardScale] = useState(1);
    useEffect(() => {
        const calculateScale = () => {
            const panelWidth = Math.min(320, Math.max(240, window.innerWidth * 0.22));
            
            // subtract both panels and the 40px screen padding on each side
            const reservedWidth = (panelWidth * 2) + 80;
            
            const availableWidth = window.innerWidth - reservedWidth;
            const availableHeight = window.innerHeight - UI.LAYOUT.TOP_BAR_RESERVED;

            // scale based on the smaller ratio
            const scaleX = availableWidth / UI.LAYOUT.BOARD_PHYSICAL_WIDTH;
            const scaleY = availableHeight / UI.LAYOUT.BOARD_PHYSICAL_HEIGHT;

            setBoardScale(Math.min(scaleX, scaleY, 1));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    // get the players info
    const metadata = user?.user_metadata;
    const p1Data: SidebarPlayerData = {
        username: playersInfo?.p1?.username || (isHost ? (metadata?.username || UI.DEFAULTS.PLAYER.NAME_P1) : UI.DEFAULTS.PLAYER.NAME_OPPONENT),
        avatar_url: playersInfo?.p1?.avatar_url || (isHost ? metadata?.avatar_url : undefined),
        elo_rating: playersInfo?.p1?.elo_rating || (isHost ? (Number(metadata?.elo_rating) || UI.DEFAULTS.PLAYER.ELO) : UI.DEFAULTS.PLAYER.ELO),
        total_wins: playersInfo?.p1?.total_wins || (isHost ? (Number(metadata?.total_wins) || UI.DEFAULTS.PLAYER.WINS) : UI.DEFAULTS.PLAYER.WINS),
        isAi: false
    };

    const p2Data: SidebarPlayerData = {
        username: isAiGame ? UI.DEFAULTS.BOT.NAME : (playersInfo?.p2?.username || (!isHost ? (metadata?.username || UI.DEFAULTS.PLAYER.NAME_P2) : UI.DEFAULTS.PLAYER.NAME_WAITING)),
        avatar_url: playersInfo?.p2?.avatar_url || (!isHost ? metadata?.avatar_url : undefined),
        elo_rating: isAiGame ? UI.DEFAULTS.BOT.ELO : (playersInfo?.p2?.elo_rating || (!isHost ? (Number(metadata?.elo_rating) || UI.DEFAULTS.PLAYER.ELO) : UI.DEFAULTS.PLAYER.ELO)),
        total_wins: isAiGame ? UI.DEFAULTS.BOT.WINS : (playersInfo?.p2?.total_wins || (!isHost ? (Number(metadata?.total_wins) || UI.DEFAULTS.PLAYER.WINS) : UI.DEFAULTS.PLAYER.WINS)),
        isAi: isAiGame
    };

    // if no initial state, return to home
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

    // if game state is not loaded yet, show loading screen
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

    // if game finished, get the winner and reason
    const isFinished = gameState.status === GameStatus.FINISHED || opponentAbandoned;
    const actualWinner = opponentAbandoned ? myRole : gameState.winner;
    const p1ReachedGoal = gameState.player1.position.r === gameState.player1.targetRow;
    const p2ReachedGoal = gameState.player2.position.r === gameState.player2.targetRow;
    const someoneReachedGoal = p1ReachedGoal || p2ReachedGoal;
    const actualReason = opponentAbandoned 
        ? UI.END_REASON.OPPONENT_LEFT
        : (gameState.status === GameStatus.FINISHED && !someoneReachedGoal)
            ? UI.END_REASON.TIMEOUT
            : UI.END_REASON.PATH_REACHED;

    // track wall count
    const isMyTurnP1 = myRole === PlayerRole.P1;
    const myWallsCount = isMyTurnP1 ? gameState.player1.wallsLeft : gameState.player2.wallsLeft;
    const opponentWallsCount = isMyTurnP1 ? gameState.player2.wallsLeft : gameState.player1.wallsLeft;

    return (
        <Box style={{ 
            position: 'relative', 
            height: '100vh', 
            width: '100vw', 
            backgroundColor: '#050505', 
            overflow: 'hidden'
        }}>
            {/* show intro only if this is not ai game */}
            {!isAiGame && isIntroPlaying && (
                <GameIntroOverlay onComplete={() => setIsIntroPlaying(false)} />
            )}

            <Box style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 200 }}>
                <BackButton onClick={handleLeaveGame} />
            </Box>

    
            <Flex 
                align="center" 
                style={{ width: '100%', height: '100%', padding: '0 40px' }}
            >
                
                {/* show side bar */}
                <Box style={{ width: 'clamp(240px, 22vw, 320px)', zIndex: 50 }}>
                    <GameSideBar 
                        state={gameState} 
                        myRole={myRole} 
                        p1Data={p1Data} 
                        p2Data={p2Data} 
                        initialTimeSeconds={UI.TIMERS.DEFAULT_MATCH_SECONDS}
                        isTimerActive={isAiGame ? true : !isIntroPlaying}
                    />
                </Box>

                {/* show board */}
                <Box style={{ flex: 1, height: '100%', position: 'relative' }}>
                    
                    <Box style={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${boardScale})`, 
                        transformOrigin: 'center center',
                        transition: 'transform 0.1s ease-out',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Flex direction="column" gap="5" align="center" justify="center">
                            <WallCounter count={opponentWallsCount} role={opponentRole} />
                            <GameBoard gameState={gameState} myRole={myRole} movePawn={movePawn} placeWall={placeWall} />
                            <WallCounter count={myWallsCount} role={myRole} />
                        </Flex>
                    </Box>

                </Box>

                {/* show action history */}
                <Box style={{ width: 'clamp(240px, 22vw, 320px)', height: '60%', maxHeight: '720px', zIndex: 50 }}>
                    <ActionPanel 
                        gameState={gameState} 
                        myRole={myRole} 
                        p1Name={p1Data.username} 
                        p2Name={p2Data.username} 
                    />
                </Box>

            </Flex>

            {/* when the game is over show msg and return to home */}
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