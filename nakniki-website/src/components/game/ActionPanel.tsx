import { Box, Text } from '@radix-ui/themes';
import { type GameState, PlayerRole, CellType } from '@nakniki/shared';
import { useState, useEffect, useRef } from 'react';

export interface ActionHistoryItem {
    id: number;
    playerRole: PlayerRole;
    playerName: string;
    actionType: 'MOVE' | 'WALL';
    details: string;
}

interface ActionPanelProps {
    gameState: GameState | null;
    myRole: PlayerRole;
    p1Name: string;
    p2Name: string;
}

export default function ActionPanel({ gameState, myRole, p1Name, p2Name }: ActionPanelProps) {
    const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);
    const prevStateRef = useRef<any>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // auto scroll
    useEffect(() => { 
        scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [actionHistory]);

    // check what is the new action
    useEffect(() => {
        if (!gameState) return;

        // if we got new state
        if (prevStateRef.current && gameState.turnCount > prevStateRef.current.turnCount) {
            const prev = prevStateRef.current;
            const movedPlayerRole = prev.turn; 
            const playerName = movedPlayerRole === PlayerRole.P1 ? p1Name : p2Name;
            
            let actionType: 'MOVE' | 'WALL' | null = null;
            let details = '';

            // get the pose of the player that moves
            const prevPos = movedPlayerRole === PlayerRole.P1 ? prev.player1.position : prev.player2.position;
            const currPos = movedPlayerRole === PlayerRole.P1 ? gameState.player1.position : gameState.player2.position;

            // check if this is move action`
            if (prevPos.r !== currPos.r || prevPos.c !== currPos.c) {
                actionType = 'MOVE';

                const x = myRole === PlayerRole.P1 ? (gameState.size - 1 - currPos.r) : currPos.r;
                const y = myRole === PlayerRole.P1 ? currPos.c : (gameState.size - 1 - currPos.c);
                details = `${x}, ${y}`;
            }
            // else, check wall placement action
            else {
                // check if wall was placed
                const prevWalls = movedPlayerRole === PlayerRole.P1 ? prev.player1.wallsLeft : prev.player2.wallsLeft;
                const currWalls = movedPlayerRole === PlayerRole.P1 ? gameState.player1.wallsLeft : gameState.player2.wallsLeft;
    
                if (currWalls < prevWalls && gameState.extendedBoard && prev.extendedBoard) {
                    actionType = 'WALL';
                    let diffFound = false;

                    // find the new wall pos
                    for (let r = 0; r < gameState.extendedBoard.length; r++) {
                        for (let c = 0; c < gameState.extendedBoard[r].length; c++) {

                            // if we found new wall
                            if (!diffFound && gameState.extendedBoard[r][c] === CellType.WALL && prev.extendedBoard[r][c] !== CellType.WALL) {
                                
                                // if this is horizontal wall
                                if (r % 2 === 1 && c % 2 === 0) {
                                    const origR = Math.floor(r / 2);
                                    const origC = Math.floor(c / 2);
                                    const x = myRole === PlayerRole.P1 ? (gameState.size - 2 - origR) : origR;
                                    const y = myRole === PlayerRole.P1 ? origC : (gameState.size - 2 - origC);
                                    details = `H ${x}, ${y}`;
                                    diffFound = true;
                                } 
                                // if this is vertical wall
                                else if (r % 2 === 0 && c % 2 === 1) {
                                    const origR = Math.floor(r / 2);
                                    const origC = Math.floor(c / 2);
                                    const x = myRole === PlayerRole.P1 ? (gameState.size - 2 - origR) : origR;
                                    const y = myRole === PlayerRole.P1 ? origC : (gameState.size - 2 - origC);
                                    details = `V ${x}, ${y}`;
                                    diffFound = true;
                                }
                            }
                        }
                    }
                }
            }

            // insert the action
            if (actionType) {
                setActionHistory(prevHistory => [...prevHistory, {
                    id: gameState.turnCount,
                    playerRole: movedPlayerRole,
                    playerName,
                    actionType: actionType!,
                    details
                }]);
            }
        }
        prevStateRef.current = gameState;
    }, [gameState, p1Name, p2Name, myRole]);

    return (
        <Box style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: 'rgba(15, 15, 15, 0.75)', 
            backdropFilter: 'blur(24px)', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
            <Box style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Text size="3" weight="bold" style={{ color: 'white', letterSpacing: '2px' }}>ACTION LOG</Text>
            </Box>
            <Box style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* if there are no actions yet, print waiting */}
                {actionHistory.length === 0 ? (
                    <Text size="2" color="gray" style={{ textAlign: 'center', marginTop: '20px' }}>Waiting for actions...</Text>
                ) : (
                    // for each action, print it
                    actionHistory.map(item => (
                        <Box key={item.id} style={{
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${item.playerRole === PlayerRole.P1 ? '#ef4444' : '#eab308'}`
                        }}>
                            <Text size="2" weight="bold" style={{ color: 'white', display: 'block' }}>{item.playerName}</Text>
                            <Text size="2" style={{ color: '#a3a3a3', marginTop: '4px', display: 'block', fontFamily: 'monospace' }}>
                                {item.actionType} {item.details}
                            </Text>
                        </Box>
                    ))
                )}
                <div ref={scrollEndRef} />
            </Box>
        </Box>
    );
}