import { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { PlayerRole, Orientation, type GameState } from '@nakniki/shared';
import BoardCell from './BoardCell';
import CellGap from './CellGap';
import Pawn from './Pawn';

interface GameBoardProps {
    gameState: GameState;
    myRole: PlayerRole;
    movePawn: (row: number, col: number) => void;
    placeWall: (row: number, col: number, orientation: Orientation) => void;
}

export default function GameBoard({ gameState, myRole, movePawn, placeWall }: GameBoardProps) {
    const size = gameState.size; // 9
    const gridIndices = Array.from({ length: size }, (_, i) => i);
    
    const [isPawnSelected, setIsPawnSelected] = useState<boolean>(false);
    
    const getPlayerAt = (r: number, c: number): PlayerRole | null => {
        if (gameState.player1.position.r === r && gameState.player1.position.c === c) {
            return PlayerRole.P1;
        }
        if (gameState.player2.position.r === r && gameState.player2.position.c === c) {
            return PlayerRole.P2;
        }
        return null;
    };

    // --- Map 9x9 indices to 17x17 matrix slots ---
    // --- FIXED: Case-Insensitive Strict Check to Prevent Rendering Mismatches ---
    const isWallPlacedAt = (r: number, c: number, orientation: Orientation): boolean => {
        if (!gameState.extendedBoard) return false;

        // Define a strict type for the unknown backend object to satisfy TypeScript
        type WallConfig = { orientation?: string; type?: string; isPlaced?: boolean };

        // 1. Get the primary gap slot
        const targetRow = orientation === Orientation.HORIZONTAL ? (r * 2 + 1) : (r * 2);
        const targetCol = orientation === Orientation.VERTICAL ? (c * 2 + 1) : (c * 2);

        // 2. Get the specific intersection slot directly inside this anchor
        const intRow = r * 2 + 1;
        const intCol = c * 2 + 1;

        const nodeValue = gameState.extendedBoard[targetRow]?.[targetCol];
        const intValue = gameState.extendedBoard[intRow]?.[intCol];

        if (nodeValue === undefined || nodeValue === null) return false;

        // Helper to check if a matrix node is actively filled with a wall, using strict typing
        const isFilled = (val: unknown, defaultType: string) => {
            if (typeof val === 'boolean') return val === true;
            
            if (typeof val === 'object' && val !== null) {
                const config = val as WallConfig;
                return config.isPlaced === true || !!config.orientation;
            }
            
            const str = String(val).toUpperCase();
            return str !== 'EMPTY' && str !== defaultType && str !== 'FALSE';
        };

        // 3. Prevent the "double wall" 3-cell glitch
        const gapFilled = isFilled(nodeValue, 'CELL');
        const intFilled = isFilled(intValue, 'INTERSECTION');

        if (!gapFilled || !intFilled) return false;

        // 4. Handle object matching strictly without using 'any'
        if (typeof nodeValue === 'object' && nodeValue !== null) {
            const config = nodeValue as WallConfig;
            const innerValue = String(config.orientation || config.type || '').toUpperCase();
            const matchTarget = String(orientation).toUpperCase();
            return innerValue === matchTarget || innerValue === matchTarget.charAt(0) || config.isPlaced === true;
        }

        // 5. Handle string and enum structures
        const cellStr = String(nodeValue).toUpperCase();
        const targetOrientation = String(orientation).toUpperCase();

        return (
            cellStr === targetOrientation || 
            cellStr === targetOrientation.charAt(0) ||
            (cellStr !== 'EMPTY' && cellStr !== 'CELL' && cellStr !== 'INTERSECTION')
        );
    };

    const isValidMoveTarget = (r: number, c: number): boolean => {
        if (!isPawnSelected) return false;
        if (gameState.turn !== myRole) return false;

        const activePlayer = myRole === PlayerRole.P1 ? gameState.player1 : gameState.player2;
        const currentPos = activePlayer.position;

        const isAdjacent = (Math.abs(currentPos.r - r) === 1 && currentPos.c === c) ||
                           (Math.abs(currentPos.c - c) === 1 && currentPos.r === r);

        const isOccupied = getPlayerAt(r, c) !== null;

        return isAdjacent && !isOccupied;
    };

    const handleCellClick = (r: number, c: number) => {
        const playerOnCell = getPlayerAt(r, c);

        if (playerOnCell === myRole && gameState.turn === myRole) {
            setIsPawnSelected(prev => !prev);
            return;
        }

        if (isValidMoveTarget(r, c)) {
            movePawn(r, c);
            setIsPawnSelected(false);
        }
    };

    const getShadowColor = (): string => {
        return gameState.turn === PlayerRole.P1 ? 'rgba(230, 45, 45, 0.4)' : 'rgba(225, 213, 45, 0.4)';
    };
    
    return (
        <Box style={{
            padding: '36px',
            backgroundColor: 'rgba(15, 15, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            boxShadow: `0 0 125px ${getShadowColor()}, inset 0 6px 20px rgba(255,255,255,0.02)`,
            position: 'relative',
            display: 'inline-block',
            transition: 'box-shadow 0.6s ease'
        }}>
            <Flex direction="column" gap="0">
                {gridIndices.map((r) => (
                    <Flex key={`row-${r}`} direction="column" gap="0">
                        {/* MAIN ROW CELLS & VERTICAL GAPS */}
                        <Flex direction="row" gap="0" align="center">
                            {gridIndices.map((c) => (
                                <Flex key={`cell-wrapper-${r}-${c}`} direction="row" gap="0" align="center">
                                    <Box style={{ width: '60px', height: '60px' }}>
                                        <BoardCell 
                                            isPossibleMove={isValidMoveTarget(r, c)}
                                            onClick={() => handleCellClick(r, c)}
                                        >
                                            {getPlayerAt(r, c) && (
                                                <Pawn 
                                                    player={getPlayerAt(r, c)!}
                                                    isCurrentTurn={gameState.turn === getPlayerAt(r, c)}
                                                    onClick={() => handleCellClick(r, c)}
                                                />
                                            )}
                                        </BoardCell>
                                    </Box>

                                    {/* Vertical Gaps slot */}
                                    {c < size - 1 && (
                                        <Box style={{ width: '10px', height: '60px', position: 'relative' }}>
                                            {r < size - 1 ? (
                                                <CellGap 
                                                    orientation={Orientation.VERTICAL}
                                                    isPlaced={isWallPlacedAt(r, c, Orientation.VERTICAL)}
                                                    isValidPreview={true}
                                                    isActiveTurn={gameState.turn === myRole}
                                                    onClick={() => placeWall(r, c, Orientation.VERTICAL)}
                                                />
                                            ) : (
                                                <Box style={{ width: '10px', height: '60px', backgroundColor: 'transparent' }} />
                                            )}
                                        </Box>
                                    )}
                                </Flex>
                            ))}
                        </Flex>

                        {/* INTERSTITIAL HORIZONTAL ROW GAP */}
                        {r < size - 1 && (
                            <Flex direction="row" gap="0">
                                {gridIndices.map((c) => (
                                    <Flex key={`horiz-gap-wrapper-${r}-${c}`} direction="row" gap="0">
                                        {/* FIX: Keep container exactly 60px wide so the board stays perfectly square */}
                                        <Box style={{ width: '60px', height: '10px', position: 'relative', zIndex: 10 }}>
                                            {c < size - 1 ? (
                                                <CellGap 
                                                    orientation={Orientation.HORIZONTAL}
                                                    isPlaced={isWallPlacedAt(r, c, Orientation.HORIZONTAL)}
                                                    isValidPreview={true}
                                                    isActiveTurn={gameState.turn === myRole}
                                                    onClick={() => placeWall(r, c, Orientation.HORIZONTAL)}
                                                />
                                            ) : (
                                                <Box style={{ width: '60px', height: '10px', backgroundColor: 'transparent' }} />
                                            )}
                                        </Box>
                                        
                                        {/* Intersection anchor node point */}
                                        {c < size - 1 && (
                                            <Box style={{ width: '10px', height: '10px', backgroundColor: 'transparent' }} />
                                        )}
                                    </Flex>
                                ))}
                            </Flex>
                        )}
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}