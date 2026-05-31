import { useState, useMemo } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { PlayerRole, Orientation, type GameState } from '@nakniki/shared';
import BoardCell from './BoardCell';
import CellGap from './CellGap';
import Pawn from './Pawn';
import { getValidMoves } from '../../utils/gameHelpers'; // Import our new engine!

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
    const isP2 = myRole === PlayerRole.P2;

    // --- NEW: Calculate the array of valid positions once per turn ---
    const validMovesArray = useMemo(() => {
        if (!isPawnSelected || gameState.turn !== myRole) return [];
        return getValidMoves(gameState, myRole);
    }, [isPawnSelected, gameState, myRole]);
    
    const getPlayerAt = (r: number, c: number): PlayerRole | null => {
        if (gameState.player1.position.r === r && gameState.player1.position.c === c) {
            return PlayerRole.P1;
        }
        if (gameState.player2.position.r === r && gameState.player2.position.c === c) {
            return PlayerRole.P2;
        }
        return null;
    };

    const isWallPlacedAt = (r: number, c: number, orientation: Orientation): boolean => {
        if (!gameState.extendedBoard) return false;

        type WallConfig = { orientation?: string; type?: string; isPlaced?: boolean };

        const targetRow = orientation === Orientation.HORIZONTAL ? (r * 2 + 1) : (r * 2);
        const targetCol = orientation === Orientation.VERTICAL ? (c * 2 + 1) : (c * 2);
        const intRow = r * 2 + 1;
        const intCol = c * 2 + 1;

        const nodeValue = gameState.extendedBoard[targetRow]?.[targetCol];
        const intValue = gameState.extendedBoard[intRow]?.[intCol];

        if (nodeValue === undefined || nodeValue === null) return false;

        const isFilled = (val: unknown, defaultType: string) => {
            if (typeof val === 'boolean') return val === true;
            if (typeof val === 'object' && val !== null) {
                const config = val as WallConfig;
                return config.isPlaced === true || !!config.orientation;
            }
            const str = String(val).toUpperCase();
            return str !== 'EMPTY' && str !== defaultType && str !== 'FALSE';
        };

        const gapFilled = isFilled(nodeValue, 'CELL');
        const intFilled = isFilled(intValue, 'INTERSECTION');

        if (!gapFilled || !intFilled) return false;

        if (typeof nodeValue === 'object' && nodeValue !== null) {
            const config = nodeValue as WallConfig;
            const innerValue = String(config.orientation || config.type || '').toUpperCase();
            const matchTarget = String(orientation).toUpperCase();
            return innerValue === matchTarget || innerValue === matchTarget.charAt(0) || config.isPlaced === true;
        }

        const cellStr = String(nodeValue).toUpperCase();
        const targetOrientation = String(orientation).toUpperCase();

        return (
            cellStr === targetOrientation || 
            cellStr === targetOrientation.charAt(0) ||
            (cellStr !== 'EMPTY' && cellStr !== 'CELL' && cellStr !== 'INTERSECTION')
        );
    };

    // --- NEW: Simply check if the current cell (r, c) is inside our calculated array! ---
    const isValidMoveTarget = (r: number, c: number): boolean => {
        return validMovesArray.some(pos => pos.r === r && pos.c === c);
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
            boxShadow: `0 0 125px ${getShadowColor()}, inset 0 ${isP2 ? '-6px' : '6px'} 20px rgba(255,255,255,0.02)`,
            position: 'relative',
            display: 'inline-block',
            transform: isP2 ? 'rotate(180deg)' : 'none',
            transition: 'box-shadow 0.6s ease, transform 0.8s ease'
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