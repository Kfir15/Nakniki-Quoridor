import { useState, useMemo } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { PlayerRole, Orientation, type GameState, CellType } from '@nakniki/shared';
import BoardCell from './BoardCell';
import CellGap from './CellGap';
import Pawn from './Pawn';
import { getValidMoves } from '../../utils/gameHelpers';

interface GameBoardProps {
    gameState: GameState;
    myRole: PlayerRole;
    movePawn: (row: number, col: number) => void;
    placeWall: (row: number, col: number, orientation: Orientation) => void;
}

export default function GameBoard({ gameState, myRole, movePawn, placeWall }: GameBoardProps) {
    const size = gameState.size;
    
    const isP2 = myRole === PlayerRole.P2;
    const baseIndices = Array.from({ length: size }, (_, i) => i);
    const renderRows = isP2 ? [...baseIndices].reverse() : baseIndices;
    const renderCols = isP2 ? [...baseIndices].reverse() : baseIndices;
    
    const [isPawnSelected, setIsPawnSelected] = useState<boolean>(false);

    const validMovesArray = useMemo(() => {
        if (!isPawnSelected || gameState.turn !== myRole) return [];
        return getValidMoves(gameState, myRole);
    }, [isPawnSelected, gameState, myRole]);
    
    const getPlayerAt = (r: number, c: number): PlayerRole | null => {
        if (gameState.player1.position.r === r && gameState.player1.position.c === c) return PlayerRole.P1;
        if (gameState.player2.position.r === r && gameState.player2.position.c === c) return PlayerRole.P2;
        return null;
    };

    // --- THE FIX: Universal checker to see if a specific matrix node contains a wall! ---
    const isWallNode = (val: unknown) => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'boolean') return val === true;
        if (typeof val === 'object' && val !== null) {
            return (val as any).isPlaced === true || !!(val as any).orientation;
        }
        const str = String(val).toUpperCase();
        return str !== 'EMPTY' && str !== 'CELL' && str !== 'INTERSECTION' && str !== 'FALSE';
    };

    // --- THE FIX: Universal coordinate grabber for the 3 segments of a wall ---
    const getWallSegments = (r: number, c: number, orientation: Orientation) => {
        const r1 = orientation === Orientation.HORIZONTAL ? (r * 2 + 1) : (r * 2);
        const c1 = orientation === Orientation.HORIZONTAL ? (c * 2) : (c * 2 + 1);
        const r2 = r * 2 + 1; 
        const c2 = c * 2 + 1;
        const r3 = orientation === Orientation.HORIZONTAL ? (r * 2 + 1) : (r * 2 + 2);
        const c3 = orientation === Orientation.HORIZONTAL ? (c * 2 + 2) : (c * 2 + 1);

        if (!gameState.extendedBoard) return [null, null, null];

        return [
            gameState.extendedBoard[r1]?.[c1],
            gameState.extendedBoard[r2]?.[c2],
            gameState.extendedBoard[r3]?.[c3]
        ];
    };

    // Checks if all 3 segments are ALREADY placed 
    const isWallPlacedAt = (r: number, c: number, orientation: Orientation): boolean => {
        if (r < 0 || r >= size - 1 || c < 0 || c >= size - 1) return false;
        const [v1, v2, v3] = getWallSegments(r, c, orientation);
        return isWallNode(v1) && isWallNode(v2) && isWallNode(v3);
    };

    // --- THE FIX: Strictly blocks previews that hang off edges or overlap existing walls! ---
    const canPlaceWallPreview = (r: number, c: number, orientation: Orientation): boolean => {
        if (r < 0 || r >= size - 1 || c < 0 || c >= size - 1) return false;
        
        const [v1, v2, v3] = getWallSegments(r, c, orientation);
        
        // For a preview to be legal, NONE of the 3 required matrix slots can be occupied!
        return !isWallNode(v1) && !isWallNode(v2) && !isWallNode(v3);
    };

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

    const getShadowColor = (): string => gameState.turn === PlayerRole.P1 ? 'rgba(230, 45, 45, 0.4)' : 'rgba(225, 213, 45, 0.4)';
    
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
                {renderRows.map((r, rIdx) => {
                    return (
                        <Flex key={`row-${r}`} direction="column" gap="0">
                            {/* MAIN ROW CELLS & VERTICAL GAPS */}
                            <Flex direction="row" gap="0" align="center">
                                {renderCols.map((c, cIdx) => {
                                    const gapR = isP2 ? r - 1 : r;
                                    const gapC = isP2 ? c - 1 : c;

                                    return (
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

                                            {/* Vertical Gaps */}
                                            {cIdx < size - 1 && (
                                                <Box style={{ width: '10px', height: '60px', position: 'relative' }}>
                                                    {rIdx < size - 1 ? (
                                                        <CellGap 
                                                            orientation={Orientation.VERTICAL}
                                                            isPlaced={isWallPlacedAt(gapR, gapC, Orientation.VERTICAL)}
                                                            isValidPreview={canPlaceWallPreview(gapR, gapC, Orientation.VERTICAL)}
                                                            isActiveTurn={gameState.turn === myRole}
                                                            onClick={() => placeWall(gapR, gapC, Orientation.VERTICAL)}
                                                        />
                                                    ) : (
                                                        <Box style={{ width: '10px', height: '60px', backgroundColor: 'transparent' }} />
                                                    )}
                                                </Box>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </Flex>

                            {/* HORIZONTAL ROW GAPS */}
                            {rIdx < size - 1 && (
                                <Flex direction="row" gap="0">
                                    {renderCols.map((c, cIdx) => {
                                        const gapR = isP2 ? r - 1 : r;
                                        const gapC = isP2 ? c - 1 : c;

                                        return (
                                            <Flex key={`horiz-gap-wrapper-${r}-${c}`} direction="row" gap="0">
                                                <Box style={{ width: '60px', height: '10px', position: 'relative', zIndex: 10 }}>
                                                    <CellGap 
                                                        orientation={Orientation.HORIZONTAL}
                                                        isPlaced={isWallPlacedAt(gapR, gapC, Orientation.HORIZONTAL)}
                                                        isValidPreview={canPlaceWallPreview(gapR, gapC, Orientation.HORIZONTAL)}
                                                        isActiveTurn={gameState.turn === myRole}
                                                        onClick={() => placeWall(gapR, gapC, Orientation.HORIZONTAL)}
                                                    />
                                                </Box>
                                                {cIdx < size - 1 && (
                                                    <Box style={{ width: '10px', height: '10px', backgroundColor: 'transparent' }} />
                                                )}
                                            </Flex>
                                        );
                                    })}
                                </Flex>
                            )}
                        </Flex>
                    );
                })}
            </Flex>
        </Box>
    );
}