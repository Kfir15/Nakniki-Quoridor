import { GameStatus, type GameState, PlayerRole, SOCKET_EVENTS as S } from "@nakniki/shared";
import { socketManager } from "../../lib/socket.manager"; //
import { useCallback, useEffect, useState } from "react";
import { Flex, Text, Box } from '@radix-ui/themes';
import PlayerCard, { type SidebarPlayerData } from './PlayerCard';

interface GameSideBarProps {
    state: GameState;
    myRole: PlayerRole;
    p1Data: SidebarPlayerData;
    p2Data: SidebarPlayerData;
    initialTimeSeconds: number;
    isTimerActive?: boolean;
}

export default function GameSideBar({
    state,
    myRole,
    p1Data,
    p2Data,
    initialTimeSeconds,
    isTimerActive = true
}: GameSideBarProps) {
    const [p1Time, setP1Time] = useState<number>(initialTimeSeconds);
    const [p2Time, setP2Time] = useState<number>(initialTimeSeconds);
    const socket = socketManager.getSocket();

    // handle timeout logic
    const handleGameTimeout = useCallback((timedOutRole: PlayerRole) => {
        if (myRole === timedOutRole) {
            // send the event to the server
            const event = p2Data.isAi ? S.CLIENT.AI_GAME_TIMEOUT : S.CLIENT.MP_GAME_TIMEOUT;
            socket?.emit(event, { gameId: state.id }); 
        }
    }, [myRole, p2Data.isAi, socket, state.id]);

    useEffect(() => {
        let interval: number | undefined;
        
        // handle the timer countdown 
        if (state.status === GameStatus.IN_PROGRESS && isTimerActive) {
            interval = window.setInterval(() => {
                // timer for player 1
                if (state.turn === PlayerRole.P1 && !p1Data.isAi) {
                    setP1Time((prev) => {
                        if (prev <= 1) {
                            handleGameTimeout(PlayerRole.P1);
                            return 0;
                        }
                        return prev - 1;
                    });
                } 
                // timer for player 2
                else if (state.turn === PlayerRole.P2 && !p2Data.isAi) {
                    setP2Time((prev) => {
                        if (prev <= 1) {
                            handleGameTimeout(PlayerRole.P2);
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [state.turn, state.status, p1Data.isAi, p2Data.isAi, handleGameTimeout, isTimerActive]);

    // timer format
    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const isP1 = myRole === PlayerRole.P1;
    const opponent = isP1 ? p2Data : p1Data;
    const me = isP1 ? p1Data : p2Data;

    return (
        <Box style={{
            width: '100%',
            backgroundColor: 'rgba(15, 15, 15, 0.75)', 
            backdropFilter: 'blur(24px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            <PlayerCard label="OPPONENT" data={opponent} time={formatTime(isP1 ? p2Time : p1Time)} isActive={state.turn !== myRole} />

            <Flex direction="column" align="center" justify="center" style={{ 
                padding: '20px 0', backgroundColor: 'rgba(0,0,0,0.3)',
                borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Text size="1" color="gray" weight="bold" style={{ letterSpacing: '3px', opacity: 0.6 }}>TURN {state.turnCount}</Text>
                <Text size="2" weight="bold" style={{ color: state.turn === myRole ? '#ef4444' : 'gray', marginTop: '4px', display: 'block' }}>
                    {state.turn === myRole ? "YOUR MOVE" : "WAITING FOR OPPONENT"}
                </Text>
            </Flex>

            <PlayerCard label="YOU" data={me} time={formatTime(isP1 ? p1Time : p2Time)} isActive={state.turn === myRole} />
        </Box>
    );
}